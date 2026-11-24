import React, { useCallback, useEffect, useRef, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { ActionModal } from './components/ActionModal';
import { Board3D } from './components/Board3D';
import { GameHUD } from './components/GameHUD';
import { LearningModal } from './components/LearningModal';
import { MainMenu } from './components/MainMenu';
import { PlayerSetup } from './components/PlayerSetup';
import { SettingsModal } from './components/SettingsModal';
import { TurnOrderModal } from './components/TurnOrderModal';
import { VictoryScreen } from './components/VictoryScreen';
import {
  BOARD_TILES,
  FACILITIES,
  FACILITY_ORDER,
  calculateCountryAssetValue,
  calculateCountryRent,
} from './data/boardConfig';
import { CHANCE_DECK, COMMUNITY_CHEST_DECK, shuffleCards } from './data/cards';
import { NPCS, pickNPCDialogue } from './data/characters';
import { QUESTION_BANK } from './data/questions';
import {
  ActiveModalState,
  AudioSettings,
  CameraPreset,
  CardItem,
  FacilityId,
  GameConfig,
  LearningProgressState,
  NPCDialogueState,
  Player,
  Question,
  ScreenMode,
  TileConfig,
} from './types/game';
import { WorldSkyTheme } from './three/landmarks';

const DEFAULT_CONFIG: GameConfig = {
  startingCoins: 1000,
  startPassBonus: 200,
  correctAnswerPoints: 10,
  challengePoints: 20,
  jailFine: 100,
  maxRounds: 12,
  targetWealth: 0,
};

const DEFAULT_AUDIO: AudioSettings = {
  musicEnabled: true,
  musicPaused: false,
  sfxEnabled: true,
  musicVolume: 0.4,
  sfxVolume: 0.7,
};

const LEARNING_STORAGE_KEY = 'globalopoly_learning_progress_v1';

const loadLearningProgress = (): LearningProgressState => {
  try {
    const raw = window.localStorage.getItem(LEARNING_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LearningProgressState>;
      return {
        exp: typeof parsed.exp === 'number' ? parsed.exp : 0,
        openedSections:
          parsed.openedSections && typeof parsed.openedSections === 'object'
            ? parsed.openedSections
            : {},
        completedTopics: Array.isArray(parsed.completedTopics) ? parsed.completedTopics : [],
      };
    }
  } catch {
    // Ignore storage parse failure
  }
  return { exp: 0, openedSections: {}, completedTopics: [] };
};

export function App() {
  const [screen, setScreen] = useState<ScreenMode>('menu');
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [audio, setAudio] = useState<AudioSettings>(DEFAULT_AUDIO);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [learningProgress, setLearningProgress] = useState<LearningProgressState>(
    loadLearningProgress,
  );

  // Overlay drawers available across screens
  const [learningModalTab, setLearningModalTab] = useState<'guide' | 'learning' | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Match state
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [lastDiceValue, setLastDiceValue] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [modal, setModal] = useState<ActiveModalState>({ type: 'none' });

  // Shuffled card decks & asked questions tracker
  const [chanceDeck, setChanceDeck] = useState<CardItem[]>(() => shuffleCards(CHANCE_DECK));
  const [chestDeck, setChestDeck] = useState<CardItem[]>(() =>
    shuffleCards(COMMUNITY_CHEST_DECK),
  );
  const usedQuestionsRef = useRef<Set<string>>(new Set());

  // 3D viewport triggers & camera
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [cameraPresetVersion, setCameraPresetVersion] = useState(0);
  const [skyTheme, setSkyTheme] = useState<WorldSkyTheme>('daylight');
  const [isPortraitScreen, setIsPortraitScreen] = useState(false);
  const [portraitBypassed, setPortraitBypassed] = useState(false);
  const [diceRequest, setDiceRequest] = useState<{ rollId: number; value: number } | null>(
    null,
  );
  const [burstRequest, setBurstRequest] = useState<{
    id: number;
    tileIndex: number;
    color: string;
  } | null>(null);

  const [npcDialogue, setNpcDialogue] = useState<NPCDialogueState>({
    npc: 'arka',
    message: NPCS.arka.introQuote,
    mood: 'happy',
    timestamp: Date.now(),
  });
  const [actionLog, setActionLog] = useState<string[]>([
    'Ekspedisi GLOBALOPOLY dimulai! Lempar dadu untuk menjelajahi dunia.',
  ]);

  // Ref tracking pending landing resolution after pawn finishes hopping
  const pendingLandingRef = useRef<{
    playerId: string;
    tileIndex: number;
    triggerTileRules: boolean;
  } | null>(null);

  // Ref for latest players inside async callbacks
  const playersRef = useRef(players);
  playersRef.current = players;
  const activeIdxRef = useRef(activePlayerIndex);
  activeIdxRef.current = activePlayerIndex;
  const modalRef = useRef(modal);
  modalRef.current = modal;
  const roundNumberRef = useRef(roundNumber);
  roundNumberRef.current = roundNumber;

  // Sync Web Audio & MP3 settings
  useEffect(() => {
    soundEngine.updateSettings(audio);
  }, [audio]);

  // Persist Mode Belajar EXP & completed topics across gameplay & sessions
  useEffect(() => {
    try {
      window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(learningProgress));
    } catch {
      // Ignore storage quota errors
    }
  }, [learningProgress]);

  // Browser autoplay unlock on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundEngine.unlock();
    };
    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Monitor viewport aspect for landscape orientation guidance
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortraitScreen(window.innerHeight > window.innerWidth && window.innerWidth < 900);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const requestLandscapeFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      const orient = window.screen.orientation as unknown as {
        lock?: (mode: string) => Promise<void>;
      };
      if (orient && typeof orient.lock === 'function') {
        await orient.lock('landscape');
      }
    } catch {
      // Browser/iframe may restrict fullscreen or orientation lock; ignore safely
    }
  }, []);

  useEffect(() => {
    if (learningModalTab !== null) {
      soundEngine.setBgmMode('learning');
    } else if (modal.type === 'country_quiz' || modal.type === 'card_draw') {
      soundEngine.setBgmMode('challenge');
    } else if (screen === 'victory') {
      soundEngine.setBgmMode('victory');
    } else {
      soundEngine.setBgmMode('main');
    }
  }, [screen, learningModalTab, modal.type]);

  const appendLog = useCallback((entry: string) => {
    setActionLog((prev) => [entry, ...prev].slice(0, 24));
  }, []);

  const triggerBurst = useCallback((tileIndex: number, color: string) => {
    setBurstRequest({ id: Date.now() + Math.random(), tileIndex, color });
  }, []);

  const pickQuestionForCountry = useCallback((countryId: string): Question => {
    const countryPool = QUESTION_BANK.filter(
      (q) => q.countryId === countryId && !usedQuestionsRef.current.has(q.id),
    );
    let chosen: Question | undefined = countryPool[Math.floor(Math.random() * countryPool.length)];
    if (!chosen) {
      const anyCountryPool = QUESTION_BANK.filter(
        (q) => q.deckTag === 'country' && !usedQuestionsRef.current.has(q.id),
      );
      chosen = anyCountryPool[Math.floor(Math.random() * anyCountryPool.length)];
    }
    if (!chosen) {
      usedQuestionsRef.current.clear();
      const resetPool = QUESTION_BANK.filter((q) => q.countryId === countryId);
      chosen = resetPool[0] || QUESTION_BANK[0];
    }
    usedQuestionsRef.current.add(chosen.id);
    return chosen;
  }, []);

  const pickCardQuestion = useCallback(
    (deck: 'chance' | 'community_chest', questionId?: string): Question => {
      if (questionId) {
        const direct = QUESTION_BANK.find((q) => q.id === questionId);
        if (direct) return direct;
      }

      const round = roundNumberRef.current;
      const targetDiff: Question['difficulty'] =
        round <= 5 ? 'Dasar' : round <= 10 ? 'Menengah' : 'Lanjut';

      const deckPool = QUESTION_BANK.filter((q) => q.deckTag === deck);
      let candidates = deckPool.filter(
        (q) =>
          q.id.startsWith('m_') &&
          q.difficulty === targetDiff &&
          !usedQuestionsRef.current.has(q.id),
      );
      if (candidates.length === 0) {
        candidates = deckPool.filter(
          (q) => q.difficulty === targetDiff && !usedQuestionsRef.current.has(q.id),
        );
      }
      if (candidates.length === 0) {
        candidates = deckPool.filter((q) => !usedQuestionsRef.current.has(q.id));
      }
      if (candidates.length === 0) {
        deckPool.forEach((q) => usedQuestionsRef.current.delete(q.id));
        candidates = deckPool.filter((q) => q.difficulty === targetDiff);
        if (candidates.length === 0) candidates = deckPool;
      }

      const chosen =
        candidates[Math.floor(Math.random() * candidates.length)] || QUESTION_BANK[0];
      usedQuestionsRef.current.add(chosen.id);
      return chosen;
    },
    [],
  );

  const checkWinConditions = useCallback(
    (nextPlayers: Player[], nextRound: number): boolean => {
      const solventPlayers = nextPlayers.filter((p) => !p.bankrupt);
      if (solventPlayers.length <= 1) {
        soundEngine.playSfx('victory');
        setScreen('victory');
        return true;
      }
      if (config.maxRounds > 0 && nextRound > config.maxRounds) {
        soundEngine.playSfx('victory');
        setScreen('victory');
        return true;
      }
      if (config.targetWealth > 0) {
        const hitTarget = solventPlayers.some((p) => {
          const assetsVal = p.ownedCountries.reduce((sum, tid) => {
            const t = BOARD_TILES.find((bt) => bt.id === tid);
            return sum + (t ? calculateCountryAssetValue(t, p.facilities[tid] || []) : 0);
          }, 0);
          return p.coins + assetsVal >= config.targetWealth;
        });
        if (hitTarget) {
          soundEngine.playSfx('victory');
          setScreen('victory');
          return true;
        }
      }
      return false;
    },
    [config.maxRounds, config.targetWealth],
  );

  const advanceTurn = useCallback(
    (updatedPlayers?: Player[]) => {
      const pls = updatedPlayers || playersRef.current;
      setModal({ type: 'none' });
      setIsAnimating(false);

      let nextIdx = (activeIdxRef.current + 1) % pls.length;
      let wrapped = nextIdx <= activeIdxRef.current;
      let guard = 0;
      while (pls[nextIdx]?.bankrupt && guard < pls.length) {
        const prev = nextIdx;
        nextIdx = (nextIdx + 1) % pls.length;
        if (nextIdx <= prev) wrapped = true;
        guard++;
      }

      const nextRound = wrapped ? roundNumber + 1 : roundNumber;
      if (checkWinConditions(pls, nextRound)) return;

      if (wrapped) {
        setRoundNumber(nextRound);
      }
      setActivePlayerIndex(nextIdx);
      setLastDiceValue(null);

      // If next player is in jail, show jail turn options after short beat
      const nextPlayer = pls[nextIdx];
      if (nextPlayer && nextPlayer.inJail && !nextPlayer.bankrupt) {
        setModal({ type: 'jail_turn', player: nextPlayer });
      }
    },
    [roundNumber, checkWinConditions],
  );

  // Resolve tile landing once 3D pawn reaches target tile
  const resolveLanding = useCallback(
    (playerId: string, tileIndex: number) => {
      const pls = playersRef.current;
      const pIdx = pls.findIndex((p) => p.id === playerId);
      if (pIdx === -1) {
        advanceTurn();
        return;
      }
      const player = pls[pIdx];
      const tile = BOARD_TILES[tileIndex];

      if (tile.type === 'start') {
        setNpcDialogue({
          npc: 'saga',
          message:
            'Kamu tiba tepat di titik START! Gunakan Global Coins secara bijak untuk membangun jaringan edukasi dan teknologi.',
          mood: 'happy',
          timestamp: Date.now(),
        });
        appendLog(`${player.name} berhenti di START.`);
        advanceTurn(pls);
        return;
      }

      if (tile.type === 'free_parking') {
        setNpcDialogue({
          npc: 'saga',
          message:
            'Istirahat sejenak di Free Parking! Tidak ada biaya atau hukuman di zona ini.',
          mood: 'happy',
          timestamp: Date.now(),
        });
        appendLog(`${player.name} beristirahat di Free Parking.`);
        advanceTurn(pls);
        return;
      }

      if (tile.type === 'jail') {
        setNpcDialogue({
          npc: 'nara',
          message:
            'Kamu hanya sedang berkunjung di JAIL. Statusmu aman dan tidak terkena hukuman.',
          mood: 'critical',
          timestamp: Date.now(),
        });
        appendLog(`${player.name} berkunjung ke JAIL (aman).`);
        advanceTurn(pls);
        return;
      }

      if (tile.type === 'go_to_jail') {
        soundEngine.playSfx('wrong');
        setIsAnimating(true);
        const jailedPlayers = pls.map((p) =>
          p.id === player.id ? { ...p, position: 12, inJail: true, jailTurns: 0 } : p,
        );
        setPlayers(jailedPlayers);
        setNpcDialogue({
          npc: 'nara',
          message:
            'Pelanggaran protokol! Kamu langsung dipindahkan ke JAIL tanpa bonus START.',
          mood: 'critical',
          timestamp: Date.now(),
        });
        appendLog(`${player.name} masuk JAIL dari petak Go To Jail!`);
        // Wait briefly for arc jump to Jail (index 12), then end turn
        pendingLandingRef.current = {
          playerId: player.id,
          tileIndex: 12,
          triggerTileRules: false,
        };
        return;
      }

      if (tile.type === 'chance' || tile.type === 'community_chest') {
        soundEngine.playSfx('cardDraw');
        const isChance = tile.type === 'chance';
        const deck = isChance ? chanceDeck : chestDeck;
        const drawnCard = deck[0];
        const nextDeck = [...deck.slice(1), drawnCard];
        if (isChance) setChanceDeck(nextDeck);
        else setChestDeck(nextDeck);

        let question: Question | undefined;
        if (drawnCard.effectType === 'trivia') {
          question = pickCardQuestion(drawnCard.deck, drawnCard.questionId);
        }

        setModal({
          type: 'card_draw',
          card: drawnCard,
          question,
          selectedOption: null,
          answered: false,
          isCorrect: false,
        });
        appendLog(
          `${player.name} mengambil kartu ${isChance ? 'Kesempatan' : 'Dana Umum'}: ${drawnCard.title}.`,
        );
        return;
      }

      if (tile.type === 'country') {
        const owner = pls.find((p) => p.ownedCountries.includes(tile.id));
        if (!owner) {
          // Unowned: answer 1 educational question to unlock purchase
          const question = pickQuestionForCountry(tile.id);
          setModal({
            type: 'country_quiz',
            tile,
            question,
            selectedOption: null,
            answered: false,
            isCorrect: false,
          });
          return;
        }
        if (owner.id === player.id) {
          // Own country: offer facility upgrade
          setModal({ type: 'country_develop', tile });
          return;
        }
        // Owned by someone else: pay rent
        const built = owner.facilities[tile.id] || [];
        const rent = calculateCountryRent(tile, built);
        setModal({
          type: 'rent_notice',
          tile,
          ownerName: owner.name,
          ownerColor: owner.color,
          amount: rent,
        });
        return;
      }

      advanceTurn(pls);
    },
    [advanceTurn, appendLog, chanceDeck, chestDeck, pickCardQuestion, pickQuestionForCountry],
  );

  const handlePawnArrival = useCallback(
    (playerId: string) => {
      const pending = pendingLandingRef.current;
      if (!pending || pending.playerId !== playerId) return;
      pendingLandingRef.current = null;
      setIsAnimating(false);
      if (pending.triggerTileRules) {
        resolveLanding(playerId, pending.tileIndex);
      } else {
        advanceTurn(playersRef.current);
      }
    },
    [advanceTurn, resolveLanding],
  );

  const executeMoveSteps = useCallback(
    (playerId: string, steps: number, allowStartBonus: boolean) => {
      const pls = playersRef.current;
      const player = pls.find((p) => p.id === playerId);
      if (!player) return;

      const oldPos = player.position;
      const rawNext = oldPos + steps;
      const passedStart = allowStartBonus && rawNext >= BOARD_TILES.length;
      const nextPos = rawNext % BOARD_TILES.length;

      const nextPlayers = pls.map((p) => {
        if (p.id !== playerId) return p;
        return {
          ...p,
          position: nextPos,
          coins: passedStart ? p.coins + config.startPassBonus : p.coins,
          lapsCompleted: passedStart ? p.lapsCompleted + 1 : p.lapsCompleted,
        };
      });

      if (passedStart) {
        soundEngine.playSfx('coin');
        triggerBurst(0, '#FACC15');
        appendLog(`${player.name} melintasi START (+${config.startPassBonus} GC).`);
      }

      setPlayers(nextPlayers);
      pendingLandingRef.current = {
        playerId,
        tileIndex: nextPos,
        triggerTileRules: true,
      };
    },
    [appendLog, config.startPassBonus, triggerBurst],
  );

  // Primary Dice Roll Handler
  const handleRollDice = useCallback(() => {
    if (isAnimating || modalRef.current.type !== 'none') return;
    const player = playersRef.current[activeIdxRef.current];
    if (!player || player.bankrupt || player.inJail) return;

    soundEngine.unlock();
    soundEngine.playSfx('diceRoll');
    const rolled = Math.floor(Math.random() * 6) + 1;
    setLastDiceValue(rolled);
    setIsAnimating(true);
    setDiceRequest({ rollId: Date.now(), value: rolled });
    appendLog(`${player.name} melempar dadu: ${rolled}.`);

    const waitMs = Math.round(920 / Math.max(0.5, animSpeed));
    window.setTimeout(() => {
      executeMoveSteps(player.id, rolled, true);
    }, waitMs);
  }, [animSpeed, appendLog, executeMoveSteps, isAnimating]);

  // Country Quiz Option Selected
  const handleSelectQuizOption = useCallback(
    (optionIdx: number) => {
      if (modalRef.current.type !== 'country_quiz' || modalRef.current.answered) return;
      const { tile, question } = modalRef.current;
      const isCorrect = optionIdx === question.correctIndex;
      soundEngine.playSfx(isCorrect ? 'correct' : 'wrong');

      const activeP = playersRef.current[activeIdxRef.current];
      const nextPlayers = playersRef.current.map((p) => {
        if (p.id !== activeP.id) return p;
        return {
          ...p,
          learningPoints: p.learningPoints + (isCorrect ? config.correctAnswerPoints : 0),
          correctAnswers: p.correctAnswers + (isCorrect ? 1 : 0),
          totalAnswers: p.totalAnswers + 1,
        };
      });
      setPlayers(nextPlayers);

      setNpcDialogue({
        npc: question.npc,
        message: pickNPCDialogue(question.npc, isCorrect ? 'correct' : 'wrong'),
        mood: isCorrect ? 'celebrate' : 'encourage',
        timestamp: Date.now(),
      });

      appendLog(
        `${activeP.name} menjawab kuis ${tile.name}: ${
          isCorrect ? `Benar (+${config.correctAnswerPoints} Poin)` : 'Salah (0 Poin)'
        }.`,
      );

      setModal({
        type: 'country_quiz',
        tile,
        question,
        selectedOption: optionIdx,
        answered: true,
        isCorrect,
      });
    },
    [appendLog, config.correctAnswerPoints],
  );

  const handleProceedAfterQuiz = useCallback(() => {
    if (modalRef.current.type !== 'country_quiz') return;
    const { tile, isCorrect } = modalRef.current;
    if (isCorrect) {
      setModal({ type: 'country_buy', tile, fromCorrectQuiz: true });
    } else {
      advanceTurn(playersRef.current);
    }
  }, [advanceTurn]);

  const handleBuyCountry = useCallback(
    (tile: TileConfig) => {
      const price = tile.price ?? 0;
      const activeP = playersRef.current[activeIdxRef.current];
      if (!activeP || activeP.coins < price) return;

      soundEngine.playSfx('coin');
      triggerBurst(tile.index, activeP.color);

      const nextPlayers = playersRef.current.map((p) =>
        p.id === activeP.id
          ? {
              ...p,
              coins: p.coins - price,
              ownedCountries: [...p.ownedCountries, tile.id],
            }
          : p,
      );
      setPlayers(nextPlayers);
      setNpcDialogue({
        npc: 'arka',
        message: pickNPCDialogue('arka', 'buyCountry'),
        mood: 'celebrate',
        timestamp: Date.now(),
      });
      appendLog(`${activeP.name} membeli ${tile.name} seharga ${price} GC.`);
      advanceTurn(nextPlayers);
    },
    [advanceTurn, appendLog, triggerBurst],
  );

  const handleBuildFacility = useCallback(
    (tile: TileConfig, facilityId: FacilityId) => {
      const activeP = playersRef.current[activeIdxRef.current];
      const def = FACILITIES[facilityId];
      const cost = Math.round((tile.price || 200) * def.costMultiplier);
      if (!activeP || activeP.coins < cost) return;
      const currentBuilt = activeP.facilities[tile.id] || [];
      if (currentBuilt.includes(facilityId)) return;

      soundEngine.playSfx('coin');
      triggerBurst(tile.index, activeP.color);

      const nextPlayers = playersRef.current.map((p) => {
        if (p.id !== activeP.id) return p;
        return {
          ...p,
          coins: p.coins - cost,
          facilities: {
            ...p.facilities,
            [tile.id]: [...currentBuilt, facilityId],
          },
        };
      });
      setPlayers(nextPlayers);
      setNpcDialogue({
        npc: 'saga',
        message: pickNPCDialogue('saga', 'developFacility'),
        mood: 'celebrate',
        timestamp: Date.now(),
      });
      appendLog(`${activeP.name} membangun ${def.name} di ${tile.name} (${cost} GC).`);
    },
    [appendLog, triggerBurst],
  );

  // Card Draw Effects
  const handleApplyCardEffect = useCallback(() => {
    if (modalRef.current.type !== 'card_draw') return;
    const { card } = modalRef.current;
    const activeP = playersRef.current[activeIdxRef.current];
    if (!activeP) return;

    if (card.effectType === 'coins') {
      const delta = card.coinDelta || 0;
      soundEngine.playSfx(delta >= 0 ? 'coin' : 'wrong');
      if (delta > 0) triggerBurst(activeP.position, '#FACC15');

      const nextPlayers = playersRef.current.map((p) => {
        if (p.id !== activeP.id) return p;
        const newCoins = Math.max(0, p.coins + delta);
        return { ...p, coins: newCoins };
      });
      setPlayers(nextPlayers);
      setNpcDialogue({
        npc: card.npc,
        message: pickNPCDialogue(card.npc, 'challengeDone'),
        mood: delta >= 0 ? 'happy' : 'critical',
        timestamp: Date.now(),
      });
      appendLog(
        `${activeP.name} (${card.title}): ${delta >= 0 ? `+${delta}` : delta} GC.`,
      );
      advanceTurn(nextPlayers);
      return;
    }

    if (card.effectType === 'jail_free') {
      soundEngine.playSfx('correct');
      const nextPlayers = playersRef.current.map((p) =>
        p.id === activeP.id ? { ...p, jailFreeCards: p.jailFreeCards + 1 } : p,
      );
      setPlayers(nextPlayers);
      appendLog(`${activeP.name} memperoleh Kartu Bebas Penjara.`);
      advanceTurn(nextPlayers);
      return;
    }

    if (card.effectType === 'move' && card.moveSteps) {
      setModal({ type: 'none' });
      setIsAnimating(true);
      // Do NOT award START bonus erroneously per PDF Page 13
      executeMoveSteps(activeP.id, card.moveSteps, false);
    }
  }, [advanceTurn, appendLog, executeMoveSteps, triggerBurst]);

  const handleSelectCardQuizOption = useCallback(
    (optionIdx: number) => {
      if (modalRef.current.type !== 'card_draw' || modalRef.current.answered) return;
      const { card, question } = modalRef.current;
      if (!question) return;

      const isCorrect = optionIdx === question.correctIndex;
      soundEngine.playSfx(isCorrect ? 'correct' : 'wrong');
      const activeP = playersRef.current[activeIdxRef.current];
      const rewardCoins = isCorrect ? card.coinDelta || 120 : 0;

      if (isCorrect) triggerBurst(activeP.position, '#10B981');

      const nextPlayers = playersRef.current.map((p) => {
        if (p.id !== activeP.id) return p;
        return {
          ...p,
          coins: p.coins + rewardCoins,
          learningPoints: p.learningPoints + (isCorrect ? config.challengePoints : 0),
          correctAnswers: p.correctAnswers + (isCorrect ? 1 : 0),
          totalAnswers: p.totalAnswers + 1,
          challengesCompleted: p.challengesCompleted + (isCorrect ? 1 : 0),
        };
      });
      setPlayers(nextPlayers);

      setNpcDialogue({
        npc: question.npc,
        message: pickNPCDialogue(question.npc, isCorrect ? 'correct' : 'wrong'),
        mood: isCorrect ? 'celebrate' : 'encourage',
        timestamp: Date.now(),
      });
      appendLog(
        `${activeP.name} menyelesaikan ${card.title}: ${
          isCorrect ? `+${rewardCoins} GC, +${config.challengePoints} Poin` : 'Belum tepat'
        }.`,
      );

      setModal({
        type: 'card_draw',
        card,
        question,
        selectedOption: optionIdx,
        answered: true,
        isCorrect,
      });
    },
    [appendLog, config.challengePoints, triggerBurst],
  );

  // Rent payment
  const handleConfirmRent = useCallback(() => {
    if (modalRef.current.type !== 'rent_notice') return;
    const { tile, amount } = modalRef.current;
    const pls = playersRef.current;
    const activeP = pls[activeIdxRef.current];
    const owner = pls.find((p) => p.ownedCountries.includes(tile.id));
    if (!activeP || !owner) {
      advanceTurn(pls);
      return;
    }

    soundEngine.playSfx('coin');
    const actualPaid = Math.min(activeP.coins, amount);
    const wentBankrupt = activeP.coins < amount;

    const nextPlayers = pls.map((p) => {
      if (p.id === activeP.id) {
        return {
          ...p,
          coins: p.coins - actualPaid,
          bankrupt: wentBankrupt,
          ownedCountries: wentBankrupt ? [] : p.ownedCountries,
          facilities: wentBankrupt ? {} : p.facilities,
        };
      }
      if (p.id === owner.id) {
        return { ...p, coins: p.coins + actualPaid };
      }
      return p;
    });

    setPlayers(nextPlayers);
    appendLog(
      wentBankrupt
        ? `${activeP.name} tidak mampu membayar sewa ${tile.name} dan dinyatakan bangkrut!`
        : `${activeP.name} membayar sewa ${actualPaid} GC kepada ${owner.name} (${tile.name}).`,
    );
    advanceTurn(nextPlayers);
  }, [advanceTurn, appendLog]);

  // Jail actions
  const handleJailPayFine = useCallback(() => {
    const activeP = playersRef.current[activeIdxRef.current];
    if (!activeP || activeP.coins < config.jailFine) return;
    soundEngine.playSfx('coin');
    const nextPlayers = playersRef.current.map((p) =>
      p.id === activeP.id
        ? { ...p, coins: p.coins - config.jailFine, inJail: false, jailTurns: 0 }
        : p,
    );
    setPlayers(nextPlayers);
    setModal({ type: 'none' });
    appendLog(`${activeP.name} membayar denda ${config.jailFine} GC dan bebas dari JAIL.`);
  }, [appendLog, config.jailFine]);

  const handleJailUseCard = useCallback(() => {
    const activeP = playersRef.current[activeIdxRef.current];
    if (!activeP || activeP.jailFreeCards <= 0) return;
    soundEngine.playSfx('correct');
    const nextPlayers = playersRef.current.map((p) =>
      p.id === activeP.id
        ? { ...p, jailFreeCards: p.jailFreeCards - 1, inJail: false, jailTurns: 0 }
        : p,
    );
    setPlayers(nextPlayers);
    setModal({ type: 'none' });
    appendLog(`${activeP.name} menggunakan Kartu Bebas Penjara!`);
  }, [appendLog]);

  const handleJailRollEscape = useCallback(() => {
    const activeP = playersRef.current[activeIdxRef.current];
    if (!activeP) return;
    soundEngine.playSfx('diceRoll');
    const rolled = Math.floor(Math.random() * 6) + 1;
    setLastDiceValue(rolled);
    setDiceRequest({ rollId: Date.now(), value: rolled });

    if (rolled >= 5) {
      soundEngine.playSfx('correct');
      const nextPlayers = playersRef.current.map((p) =>
        p.id === activeP.id ? { ...p, inJail: false, jailTurns: 0 } : p,
      );
      setPlayers(nextPlayers);
      setModal({ type: 'none' });
      setIsAnimating(true);
      appendLog(`${activeP.name} melempar ${rolled} dan berhasil bebas dari JAIL!`);
      window.setTimeout(() => {
        executeMoveSteps(activeP.id, rolled, true);
      }, Math.round(900 / Math.max(0.5, animSpeed)));
    } else {
      const nextTurns = activeP.jailTurns + 1;
      if (nextTurns >= 3) {
        // Auto release on 3rd failed turn
        const pay = Math.min(activeP.coins, config.jailFine);
        const nextPlayers = playersRef.current.map((p) =>
          p.id === activeP.id
            ? { ...p, coins: p.coins - pay, inJail: false, jailTurns: 0 }
            : p,
        );
        setPlayers(nextPlayers);
        appendLog(
          `${activeP.name} melempar ${rolled}. Masa tahanan 3 giliran selesai, bebas dengan biaya ${pay} GC.`,
        );
        advanceTurn(nextPlayers);
      } else {
        const nextPlayers = playersRef.current.map((p) =>
          p.id === activeP.id ? { ...p, jailTurns: nextTurns } : p,
        );
        setPlayers(nextPlayers);
        appendLog(`${activeP.name} melempar ${rolled} (butuh 5/6) — tetap di JAIL.`);
        advanceTurn(nextPlayers);
      }
    }
  }, [advanceTurn, animSpeed, appendLog, config.jailFine, executeMoveSteps]);

  // Bot AI Turn Controller
  useEffect(() => {
    if (screen !== 'playing' || isAnimating) return;
    const activeP = players[activePlayerIndex];
    if (!activeP || !activeP.isBot || activeP.bankrupt) return;

    if (modal.type === 'none') {
      const t = window.setTimeout(() => {
        handleRollDice();
      }, 950);
      return () => window.clearTimeout(t);
    }

    if (modal.type === 'jail_turn') {
      const t = window.setTimeout(() => {
        if (activeP.jailFreeCards > 0) handleJailUseCard();
        else if (activeP.coins >= config.jailFine + 200) handleJailPayFine();
        else handleJailRollEscape();
      }, 950);
      return () => window.clearTimeout(t);
    }

    if (modal.type === 'country_quiz') {
      if (!modal.answered) {
        const t = window.setTimeout(() => {
          const smartHit = Math.random() < 0.72;
          const pick = smartHit
            ? modal.question.correctIndex
            : ((modal.question.correctIndex + 1 + Math.floor(Math.random() * 3)) % 4);
          handleSelectQuizOption(pick);
        }, 1250);
        return () => window.clearTimeout(t);
      } else {
        const t = window.setTimeout(() => {
          handleProceedAfterQuiz();
        }, 1300);
        return () => window.clearTimeout(t);
      }
    }

    if (modal.type === 'country_buy') {
      const t = window.setTimeout(() => {
        const price = modal.tile.price ?? 0;
        if (activeP.coins >= price + 80) {
          handleBuyCountry(modal.tile);
        } else {
          appendLog(`${activeP.name} memilih melewati pembelian ${modal.tile.name}.`);
          advanceTurn(playersRef.current);
        }
      }, 950);
      return () => window.clearTimeout(t);
    }

    if (modal.type === 'country_develop') {
      const t = window.setTimeout(() => {
        const built = activeP.facilities[modal.tile.id] || [];
        const available = FACILITY_ORDER.find((fid) => !built.includes(fid));
        if (available) {
          const cost = Math.round(
            (modal.tile.price || 200) * FACILITIES[available].costMultiplier,
          );
          if (activeP.coins >= cost + 250) {
            handleBuildFacility(modal.tile, available);
          }
        }
        advanceTurn(playersRef.current);
      }, 1050);
      return () => window.clearTimeout(t);
    }

    if (modal.type === 'card_draw') {
      if (modal.card.effectType !== 'trivia') {
        const t = window.setTimeout(() => {
          handleApplyCardEffect();
        }, 1250);
        return () => window.clearTimeout(t);
      } else if (!modal.answered) {
        const t = window.setTimeout(() => {
          if (!modal.question) {
            advanceTurn(playersRef.current);
            return;
          }
          const smartHit = Math.random() < 0.75;
          const pick = smartHit
            ? modal.question.correctIndex
            : ((modal.question.correctIndex + 1) % 4);
          handleSelectCardQuizOption(pick);
        }, 1250);
        return () => window.clearTimeout(t);
      } else {
        const t = window.setTimeout(() => {
          advanceTurn(playersRef.current);
        }, 1300);
        return () => window.clearTimeout(t);
      }
    }

    if (modal.type === 'rent_notice') {
      const t = window.setTimeout(() => {
        handleConfirmRent();
      }, 1100);
      return () => window.clearTimeout(t);
    }
  }, [
    screen,
    isAnimating,
    players,
    activePlayerIndex,
    modal,
    config.jailFine,
    handleRollDice,
    handleJailUseCard,
    handleJailPayFine,
    handleJailRollEscape,
    handleSelectQuizOption,
    handleProceedAfterQuiz,
    handleBuyCountry,
    handleBuildFacility,
    handleApplyCardEffect,
    handleSelectCardQuizOption,
    handleConfirmRent,
    advanceTurn,
    appendLog,
  ]);

  const handleStartMatchFromSetup = (preparedPlayers: Player[]) => {
    usedQuestionsRef.current.clear();
    setChanceDeck(shuffleCards(CHANCE_DECK));
    setChestDeck(shuffleCards(COMMUNITY_CHEST_DECK));
    setPlayers(preparedPlayers);
    setScreen('turn_order');
  };

  const handleOrderConfirmed = (orderedPlayers: Player[]) => {
    setPlayers(orderedPlayers);
    setActivePlayerIndex(0);
    setRoundNumber(1);
    setLastDiceValue(null);
    setModal({ type: 'none' });
    setIsAnimating(false);
    setNpcDialogue({
      npc: 'arka',
      message: NPCS.arka.introQuote,
      mood: 'happy',
      timestamp: Date.now(),
    });
    setActionLog([
      `Ekspedisi dimulai! Urutan pertama: ${orderedPlayers[0].name}.`,
    ]);
    setScreen('playing');
  };

  const handlePlayAgain = () => {
    const resetPlayers: Player[] = players.map((p) => ({
      ...p,
      position: 0,
      coins: config.startingCoins,
      learningPoints: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      challengesCompleted: 0,
      ownedCountries: [],
      facilities: {},
      inJail: false,
      jailTurns: 0,
      jailFreeCards: 0,
      bankrupt: false,
      lapsCompleted: 0,
    }));
    handleStartMatchFromSetup(resetPlayers);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 relative">
      {screen === 'menu' && (
        <MainMenu
          audio={audio}
          learningProgress={learningProgress}
          onToggleMusic={() =>
            setAudio((a) => ({ ...a, musicEnabled: !a.musicEnabled }))
          }
          onToggleMusicPause={() =>
            setAudio((a) => ({ ...a, musicPaused: !a.musicPaused }))
          }
          onStartSetup={() => setScreen('setup')}
          onOpenGuide={() => setLearningModalTab('guide')}
          onOpenLearning={() => setLearningModalTab('learning')}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {screen === 'setup' && (
        <PlayerSetup
          config={config}
          onUpdateConfig={setConfig}
          onBack={() => setScreen('menu')}
          onStartGame={handleStartMatchFromSetup}
        />
      )}

      {screen === 'turn_order' && (
        <TurnOrderModal players={players} onOrderConfirmed={handleOrderConfirmed} />
      )}

      {screen === 'playing' && players.length > 0 && (
        <>
          <div className="w-full h-full">
            <Board3D
              players={players}
              activePlayerIndex={activePlayerIndex}
              cameraPreset={cameraPreset}
              cameraPresetVersion={cameraPresetVersion}
              skyTheme={skyTheme}
              diceRequest={diceRequest}
              burstRequest={burstRequest}
              animationSpeed={animSpeed}
              onTileClick={(tile) => {
                if (modal.type === 'none' && !isAnimating) {
                  soundEngine.playSfx('buttonClick');
                  setModal({ type: 'tile_info', tile });
                }
              }}
              onPawnHop={() => {
                soundEngine.playPawnStep(animSpeed);
              }}
              onPawnArrival={handlePawnArrival}
            />
          </div>

          <GameHUD
            players={players}
            activePlayerIndex={activePlayerIndex}
            roundNumber={roundNumber}
            config={config}
            lastDiceValue={lastDiceValue}
            canRoll={modal.type === 'none' && !isAnimating}
            isAnimating={isAnimating}
            npcDialogue={npcDialogue}
            actionLog={actionLog}
            cameraPreset={cameraPreset}
            skyTheme={skyTheme}
            audio={audio}
            onRollDice={handleRollDice}
            onSelectCamera={(preset) => {
              setCameraPreset(preset);
              setCameraPresetVersion((v) => v + 1);
            }}
            onSelectSkyTheme={(theme) => setSkyTheme(theme)}
            onRequestLandscapeFullscreen={requestLandscapeFullscreen}
            onToggleMusic={() =>
              setAudio((a) => ({ ...a, musicEnabled: !a.musicEnabled }))
            }
            onToggleMusicPause={() =>
              setAudio((a) => ({ ...a, musicPaused: !a.musicPaused }))
            }
            onToggleSfx={() =>
              setAudio((a) => {
                const next = !a.sfxEnabled;
                if (next) soundEngine.playSfx('buttonClick');
                return { ...a, sfxEnabled: next };
              })
            }
            onOpenGuide={() => setLearningModalTab('guide')}
            onOpenLearning={() => setLearningModalTab('learning')}
            onOpenSettings={() => setSettingsOpen(true)}
            onFinishGameEarly={() => {
              soundEngine.playSfx('victory');
              setScreen('victory');
            }}
            onExitToMenu={() => {
              setModal({ type: 'none' });
              setScreen('menu');
            }}
          />

          <ActionModal
            modal={modal}
            activePlayer={players[activePlayerIndex] || players[0]}
            players={players}
            config={config}
            onSelectQuizOption={handleSelectQuizOption}
            onProceedAfterQuiz={handleProceedAfterQuiz}
            onBuyCountry={handleBuyCountry}
            onSkipBuy={() => {
              const ap = players[activePlayerIndex];
              if (ap && modal.type === 'country_buy') {
                appendLog(`${ap.name} memilih tidak membeli ${modal.tile.name}.`);
              }
              advanceTurn(players);
            }}
            onBuildFacility={handleBuildFacility}
            onFinishDevelop={() => advanceTurn(players)}
            onApplyCardEffect={handleApplyCardEffect}
            onSelectCardQuizOption={handleSelectCardQuizOption}
            onFinishCardQuiz={() => advanceTurn(players)}
            onConfirmRent={handleConfirmRent}
            onJailPayFine={handleJailPayFine}
            onJailUseCard={handleJailUseCard}
            onJailRollEscape={handleJailRollEscape}
            onCloseTileInfo={() => setModal({ type: 'none' })}
          />
        </>
      )}

      {screen === 'victory' && (
        <VictoryScreen
          players={players}
          audio={audio}
          onToggleMusic={() =>
            setAudio((a) => ({ ...a, musicEnabled: !a.musicEnabled }))
          }
          onToggleMusicPause={() =>
            setAudio((a) => ({ ...a, musicPaused: !a.musicPaused }))
          }
          onPlayAgain={handlePlayAgain}
          onReturnMenu={() => setScreen('menu')}
        />
      )}

      {learningModalTab !== null && (
        <LearningModal
          initialTab={learningModalTab}
          progress={learningProgress}
          onUpdateProgress={setLearningProgress}
          onClose={() => setLearningModalTab(null)}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          audio={audio}
          onChangeAudio={setAudio}
          config={config}
          onChangeConfig={setConfig}
          animSpeed={animSpeed}
          onChangeAnimSpeed={setAnimSpeed}
          inActiveMatch={screen === 'playing'}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {isPortraitScreen && !portraitBypassed && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-6 text-center">
          <div className="max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">
              Gunakan Mode Landscape
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              GLOBALOPOLY dirancang dalam mode landscape agar papan 3D, landmark berbagai negara, dan panel 3–4 pemain terlihat luas. Putar perangkatmu secara horizontal atau aktifkan Layar Penuh Landscape.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  void requestLandscapeFullscreen();
                  setPortraitBypassed(true);
                }}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Aktifkan Layar Penuh Landscape
              </button>
              <button
                type="button"
                onClick={() => setPortraitBypassed(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Lanjutkan Tampilan Saat Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
