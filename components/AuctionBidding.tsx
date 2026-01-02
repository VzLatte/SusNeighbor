import React, { useState } from 'react';
import { Player, PowerUp, RiskContract } from '../types';
import { soundService } from '../services/soundService';

interface AuctionBiddingProps {
  player: Player;
  availablePowers: PowerUp[];
  onComplete: (bid: { power: PowerUp | null, amount: number, risk: RiskContract | null }) => void;
}

const POWER_PRICES: { [key in PowerUp]: number } = {
  [PowerUp.DOUBLE_VOTE]: 8,
  [PowerUp.POLYGRAPH]: 6,
  [PowerUp.GHOST_WHISPER]: 5,
  [PowerUp.VETO]: 4,
  [PowerUp.INSIGHT]: 2
};

const RISK_REWARDS: { [key in RiskContract]: number } = {
  [RiskContract.VERBOSE]: 3,
  [RiskContract.MINIMALIST]: 2,
  [RiskContract.TARGET]: 4
};

const AuctionBidding: React.FC<AuctionBiddingProps> = ({ player, availablePowers, onComplete }) => {
  const [selectedPower, setSelectedPower] = useState<PowerUp | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskContract | null>(null);

  const powerCost = selectedPower ? POWER_PRICES[selectedPower] : 0;
  const riskGain = selectedRisk ? RISK_REWARDS[selectedRisk] : 0;
  const netCost = Math.max(0, powerCost - riskGain);
  const remainingCredits = player.credits - netCost;
  const isAffordable = remainingCredits >= 0;

  const handleConfirm = () => {
    onComplete({ 
      power: selectedPower, 
      amount: netCost, 
      risk: selectedRisk 
    });
  };

  const handlePass = () => {
    onComplete({ 
      power: null, 
      amount: 0, 
      risk: null 
    });
  };

  const togglePower = (p: PowerUp) => {
    soundService.playClick();
    setSelectedPower(selectedPower === p ? null : p);
  };

  const toggleRisk = (r: RiskContract) => {
    soundService.playClick();
    setSelectedRisk(selectedRisk === r ? null : r);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in slide-in-from-right duration-300">
      {/* Credit Summary Dashboard */}
      <div className="p-6 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-2xl space-y-4">
        <div className="text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{player.name}</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Procurement Office</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 p-3 rounded-2xl text-center border border-slate-700/30">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Wallet</p>
                <p className="text-lg font-black text-slate-100">{player.credits}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-2xl text-center border border-slate-700/30">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Cost</p>
                <p className={`text-lg font-black ${netCost > 0 ? 'text-pink-500' : 'text-slate-400'}`}>
                    {netCost > 0 ? `-${netCost}` : '0'}
                </p>
            </div>
            <div className={`p-3 rounded-2xl text-center border ${isAffordable ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Final</p>
                <p className={`text-lg font-black ${isAffordable ? 'text-indigo-400' : 'text-red-500'}`}>
                    {remainingCredits}
                </p>
            </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar pb-4">
        {/* Power Ups Section */}
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">High-Tech Acquisitions</label>
            <div className="grid grid-cols-1 gap-2 px-1">
                {availablePowers.map(p => (
                   <button 
                     key={p} 
                     onClick={() => togglePower(p)}
                     className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group active:scale-[0.98] ${
                        selectedPower === p 
                            ? 'border-indigo-500 bg-indigo-500/10' 
                            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                     }`}
                   >
                     {selectedPower === p && (
                         <div className="absolute top-0 right-0 p-1">
                             <div className="bg-indigo-500 text-white p-0.5 rounded-full">
                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                             </div>
                         </div>
                     )}
                     <div className="flex justify-between items-center">
                        <div>
                            <span className="font-black text-sm block">{p}</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Strategic Advantage</span>
                        </div>
                        <div className="text-right">
                            <span className="font-black text-indigo-400 text-lg">${POWER_PRICES[p]}</span>
                            <span className="text-[8px] text-slate-600 block uppercase font-bold">Price</span>
                        </div>
                     </div>
                   </button>
                ))}
            </div>
        </div>

        {/* Risk Contracts Section */}
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Risk Liability Contracts</label>
            <div className="grid grid-cols-1 gap-2 px-1">
                {Object.values(RiskContract).map(r => (
                   <button 
                     key={r} 
                     onClick={() => toggleRisk(r)}
                     className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                        selectedRisk === r 
                            ? 'border-orange-500 bg-orange-500/10' 
                            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                     }`}
                   >
                     <div className="flex justify-between items-center">
                        <div>
                            <span className="font-black text-sm block">{r}</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Behavioral Handicap</span>
                        </div>
                        <div className="text-right">
                            <span className="font-black text-orange-400 text-lg">+{RISK_REWARDS[r]}</span>
                            <span className="text-[8px] text-slate-600 block uppercase font-bold">Grant</span>
                        </div>
                     </div>
                   </button>
                ))}
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button 
            disabled={!isAffordable || (!selectedPower && !selectedRisk)}
            onClick={handleConfirm}
            className={`w-full py-5 rounded-3xl font-black text-xl shadow-xl transition-all ${
                isAffordable && (selectedPower || selectedRisk)
                    ? 'bg-indigo-600 text-white active:scale-95 border-b-4 border-indigo-900' 
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border-b-4 border-slate-900'
            }`}
        >
            {!isAffordable ? 'INSUFFICIENT FUNDS' : 'COMMIT LOADOUT'}
        </button>
        
        <button 
            onClick={handlePass}
            className="w-full py-4 bg-slate-800/40 border border-slate-800 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:text-slate-300 transition-colors"
        >
            Skip Acquisition / Pass
        </button>
      </div>

      {!isAffordable && (
          <p className="text-[10px] text-pink-500 text-center font-black uppercase tracking-widest animate-pulse">
            Budget Exceeded. Select a Risk Contract to earn credits!
          </p>
      )}
    </div>
  );
};

export default AuctionBidding;