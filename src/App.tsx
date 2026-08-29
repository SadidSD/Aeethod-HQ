import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { GameEngine } from './core/engine';
import { GameState } from './core/types';
import { getAgencyManager } from './core/agency';
import { getMultiplayerManager } from './core/multiplayer';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import BuildMenu from './components/BuildMenu';
import InventoryMenu from './components/InventoryMenu';
import ActionBar from './components/ActionBar';
import ComputerModal from './components/ComputerModal';
import MemberModal from './components/MemberModal';
import BoardModal from './components/BoardModal';
import DesignerModal from './components/DesignerModal';
import FrontendDevModal from './components/FrontendDevModal';
import BackendDevModal from './components/BackendDevModal';
import ClientModal from './components/ClientModal';
import MultiplayerModal from './components/MultiplayerModal';
import OfficeChat from './components/OfficeChat';

export default function App() {
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showBuild, setShowBuild] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showComputer, setShowComputer] = useState(false);
  const [showDesignerPC, setShowDesignerPC] = useState(false);
  const [showClientPC, setShowClientPC] = useState(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
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
  }, [agencyManager, handleRefresh]);

  // Check URL query params for ?room=ROOM_CODE on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      multiplayer.joinRoom(roomParam).then(() => {
        handleRefresh();
      });
    }
  }, [multiplayer, handleRefresh]);

  const handleEngineReady = useCallback(
    (engine: GameEngine) => {
      engineRef.current = engine;
      engine.agencyManager = agencyManager;
      setGameState({ ...engine.state });

      // Link multiplayer to engine
      engine.onPositionChange = (x, y, facing, room) => {
        multiplayer.broadcastPosition(x, y, facing, room);
      };

      multiplayer.onPlayersUpdate = (players) => {
        if (engineRef.current) {
          engineRef.current.remotePlayers = players;
        }
        handleRefresh();
      };

      multiplayer.onConnectionChange = () => {
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

      engine.onOpenMember = (memberId: string) => {
        setActiveMemberModal(memberId);
      };

      engine.onOpenBoard = (boardType: 'leads' | 'architecture' | 'content') => {
        setActiveBoardModal(boardType);
      };
    },
    [agencyManager, multiplayer, handleRefresh]
  );

  const isAnyModalOpen =
    showComputer ||
    showDesignerPC ||
    showClientPC ||
    showMultiplayerModal ||
    activeMemberModal !== null ||
    activeBoardModal !== null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowComputer(false);
        setShowDesignerPC(false);
        setShowClientPC(false);
        setShowMultiplayerModal(false);
        setActiveMemberModal(null);
        setActiveBoardModal(null);
        setShowBuild(false);
        setShowInventory(false);
        if (engineRef.current) engineRef.current.selectedBuilding = null;
        return;
      }

      // Don't intercept other keys (b, i) when any modal is open
      if (isAnyModalOpen) return;

      if (e.key.toLowerCase() === 'b') setShowBuild((prev) => !prev);
      if (e.key.toLowerCase() === 'i') setShowInventory((prev) => !prev);
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
          onOpenMultiplayer={() => setShowMultiplayerModal(true)}
          coopConnected={multiplayer.isConnected}
          coopRoomId={multiplayer.currentRoomId}
          coopPlayerCount={multiplayer.remotePlayers.size + 1}
        />
      )}

      <ActionBar
        onBuild={() => setShowBuild(true)}
        onCraft={() => setShowInventory(true)}
        selectedBuilding={engineRef.current?.selectedBuilding || null}
        selectedDirection={engineRef.current?.selectedDirection || 'up'}
      />

      {/* Office Chat */}
      <OfficeChat multiplayer={multiplayer} onRefresh={handleRefresh} />

      {/* Co-Op Multiplayer Modal */}
      <MultiplayerModal
        multiplayer={multiplayer}
        isOpen={showMultiplayerModal}
        onClose={() => setShowMultiplayerModal(false)}
        onRefresh={handleRefresh}
      />

      {showBuild && engineRef.current && gameState && (
        <BuildMenu
          engine={engineRef.current}
          state={gameState}
          onClose={() => setShowBuild(false)}
        />
      )}

      {showInventory && engineRef.current && gameState && (
        <InventoryMenu
          engine={engineRef.current}
          state={gameState}
          onClose={() => setShowInventory(false)}
        />
      )}

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
