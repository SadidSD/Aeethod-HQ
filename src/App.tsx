import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { GameEngine } from './core/engine';
import { GameState } from './core/types';
import { getAgencyManager } from './core/agency';
import { getMultiplayerManager } from './core/multiplayer';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import ActionBar from './components/ActionBar';
import ComputerModal from './components/ComputerModal';
import MemberModal from './components/MemberModal';
import BoardModal from './components/BoardModal';
import DesignerModal from './components/DesignerModal';
import FrontendDevModal from './components/FrontendDevModal';
import BackendDevModal from './components/BackendDevModal';
import ClientModal from './components/ClientModal';
import LoginModal from './components/LoginModal';
import OfficeChat from './components/OfficeChat';
import ResearchModal from './components/ResearchModal';

export default function App() {
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showComputer, setShowComputer] = useState(false);
  const [showDesignerPC, setShowDesignerPC] = useState(false);
  const [showClientPC, setShowClientPC] = useState(false);
  const [showResearchPC, setShowResearchPC] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(() => {
    return localStorage.getItem('aeethod_logged_in') !== 'true';
  });
  const [loginModalStep, setLoginModalStep] = useState<'code' | 'avatar'>('code');
  const [activeMemberModal, setActiveMemberModal] = useState<string | null>(null);
  const [activeBoardModal, setActiveBoardModal] = useState<'leads' | 'architecture' | 'content' | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Singleton managers
  const agencyManager = useMemo(() => getAgencyManager(), []);
  const multiplayer = useMemo(() => getMultiplayerManager(), []);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    agencyManager.onCloudUpdate = handleRefresh;
    const cleanupBoard = multiplayer.addBoardUpdateListener((type, data) => {
      if (type === 'tasks_sync') {
        agencyManager.handleIncomingTaskSync(data);
      }
    });
    return () => {
      cleanupBoard();
    };
  }, [agencyManager, multiplayer, handleRefresh]);

  // Auto-connect to shared studio lobby room on start
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || 'AEETHOD-HQ';
    multiplayer.joinRoom(roomParam).then(() => {
      handleRefresh();
    });
  }, [multiplayer, handleRefresh]);

  const handleEngineReady = useCallback(
    (engine: GameEngine) => {
      engineRef.current = engine;
      engine.agencyManager = agencyManager;
      engine.localPlayerInfo = {
        name: multiplayer.localPlayer.name,
        role: multiplayer.localPlayer.role,
        color: multiplayer.localPlayer.color,
        character: multiplayer.localPlayer.character,
      };
      setGameState({ ...engine.state });

      // Link multiplayer to engine
      multiplayer.lastKnownPosition.x = engine.state.player.x;
      multiplayer.lastKnownPosition.y = engine.state.player.y;
      multiplayer.lastKnownPosition.currentRoom = engine.state.activeRoom || 'Reception';

      engine.onPositionChange = (x, y, facing, room) => {
        multiplayer.broadcastPosition(x, y, facing, room);
      };

      multiplayer.onPlayersUpdate = (players) => {
        if (engineRef.current) {
          engineRef.current.remotePlayers = players;
        }
        handleRefresh();
      };

      multiplayer.onChatMessage = (msg) => {
        if (engineRef.current && engineRef.current.remotePlayers.has(msg.senderId)) {
          const rp = engineRef.current.remotePlayers.get(msg.senderId)!;
          rp.lastMessage = { text: msg.text, timestamp: msg.timestamp };
        }
        handleRefresh();
      };

      engine.onStateChange = (state) => {
        setGameState({ ...state });
      };

      engine.onOpenComputer = () => {
        setShowComputer(true);
      };

      engine.onOpenDesignerPC = () => {
        setShowDesignerPC(true);
      };

      engine.onOpenClientPC = () => {
        setShowClientPC(true);
      };

      engine.onOpenResearchPC = () => {
        setShowResearchPC(true);
      };

      engine.onOpenMember = (memberId: string) => {
        setActiveMemberModal(memberId);
      };

      engine.onOpenBoard = (boardType: 'leads' | 'architecture' | 'content') => {
        setActiveBoardModal(boardType);
      };
    },
    [agencyManager, multiplayer, handleRefresh]
  );

  // Sync engine localPlayerInfo whenever multiplayer localPlayer updates
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.localPlayerInfo = {
        name: multiplayer.localPlayer.name,
        role: multiplayer.localPlayer.role,
        color: multiplayer.localPlayer.color,
        character: multiplayer.localPlayer.character,
      };
    }
  }, [multiplayer.localPlayer, refreshTrigger]);

  const isAnyModalOpen =
    showComputer ||
    showDesignerPC ||
    showClientPC ||
    showResearchPC ||
    showLoginModal ||
    activeMemberModal !== null ||
    activeBoardModal !== null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowComputer(false);
        setShowDesignerPC(false);
        setShowClientPC(false);
        setShowResearchPC(false);
        setShowLoginModal(false);
        setActiveMemberModal(null);
        setActiveBoardModal(null);
        if (engineRef.current) engineRef.current.selectedBuilding = null;
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnyModalOpen]);

  return (
    <div className="w-screen h-screen overflow-hidden select-none bg-[#0c1015] font-exo">
      <GameCanvas engineRef={engineRef} onEngineReady={handleEngineReady} />

      {gameState && (
        <HUD
          state={gameState}
          onOpenProfile={() => {
            setLoginModalStep('avatar');
            setShowLoginModal(true);
          }}
          playerName={multiplayer.localPlayer.name}
          playerRole={multiplayer.localPlayer.role}
          playerAura={multiplayer.localPlayer.character?.auraColor || multiplayer.localPlayer.color}
          onlineCount={multiplayer.remotePlayers.size + 1}
          roomId={multiplayer.currentRoomId}
        />
      )}

      <ActionBar />

      {/* Office Chat */}
      <OfficeChat multiplayer={multiplayer} onRefresh={handleRefresh} />

      {/* Character Setup & Login Modal */}
      <LoginModal
        multiplayer={multiplayer}
        manager={agencyManager}
        isOpen={showLoginModal}
        initialStep={loginModalStep}
        onClose={() => setShowLoginModal(false)}
        onLoginComplete={() => {
          localStorage.setItem('aeethod_logged_in', 'true');
          if (engineRef.current) {
            engineRef.current.localPlayerInfo = {
              name: multiplayer.localPlayer.name,
              role: multiplayer.localPlayer.role,
              color: multiplayer.localPlayer.color,
              character: multiplayer.localPlayer.character,
            };
          }
          handleRefresh();
        }}
      />

      {showComputer && (
        <ComputerModal
          manager={agencyManager}
          onClose={() => setShowComputer(false)}
        />
      )}

      {showDesignerPC && (
        <DesignerModal
          agency={agencyManager.getState()}
          manager={agencyManager}
          onClose={() => setShowDesignerPC(false)}
          onRefresh={handleRefresh}
        />
      )}

      {showClientPC && (
        <ClientModal
          agency={agencyManager.getState()}
          manager={agencyManager}
          onClose={() => setShowClientPC(false)}
          onRefresh={handleRefresh}
        />
      )}

      {showResearchPC && (
        <ResearchModal
          isOpen={showResearchPC}
          onClose={() => setShowResearchPC(false)}
          agencyManager={agencyManager}
        />
      )}

      {activeMemberModal === 'frontend' ? (
        <FrontendDevModal
          agency={agencyManager.getState()}
          manager={agencyManager}
          onClose={() => setActiveMemberModal(null)}
          onRefresh={handleRefresh}
        />
      ) : activeMemberModal === 'backend' ? (
        <BackendDevModal
          agency={agencyManager.getState()}
          manager={agencyManager}
          onClose={() => setActiveMemberModal(null)}
          onRefresh={handleRefresh}
        />
      ) : activeMemberModal === 'designer' ? (
        <DesignerModal
          agency={agencyManager.getState()}
          manager={agencyManager}
          onClose={() => setActiveMemberModal(null)}
          onRefresh={handleRefresh}
        />
      ) : activeMemberModal === 'client' ? (
        <ClientModal
          agency={agencyManager.getState()}
          manager={agencyManager}
          onClose={() => setActiveMemberModal(null)}
          onRefresh={handleRefresh}
        />
      ) : activeMemberModal ? (
        <MemberModal
          memberId={activeMemberModal}
          agency={agencyManager.getState()}
          manager={agencyManager}
          onClose={() => setActiveMemberModal(null)}
          onRefresh={handleRefresh}
        />
      ) : null}

      {activeBoardModal && (
        <BoardModal
          boardType={activeBoardModal}
          agency={agencyManager.getState()}
          manager={agencyManager}
          onClose={() => setActiveBoardModal(null)}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
