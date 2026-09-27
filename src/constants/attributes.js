import React from 'react';
import { Star, Zap, Target, Send, Sparkles, Shield, Dumbbell } from 'lucide-react';

export const ATTRIBUTES = [
  { 
    key: 'pac', 
    label: 'Pace', 
    short: 'PAC', 
    Icon: Zap, 
    color: '#0284c7', 
    bgColor: '#e0f2fe',
    desc: 'Acceleration & Sprint Speed' 
  },
  { 
    key: 'sho', 
    label: 'Shooting', 
    short: 'SHO', 
    Icon: Target, 
    color: '#e11d48', 
    bgColor: '#ffe4e6',
    desc: 'Finishing & Shot Power' 
  },
  { 
    key: 'pas', 
    label: 'Passing', 
    short: 'PAS', 
    Icon: Send, 
    color: '#059669', 
    bgColor: '#d1fae5',
    desc: 'Vision & Crossing' 
  },
  { 
    key: 'dri', 
    label: 'Dribbling', 
    short: 'DRI', 
    Icon: Sparkles, 
    color: '#7c3aed', 
    bgColor: '#ede9fe',
    desc: 'Agility, Ball Control & Composure' 
  },
  { 
    key: 'def', 
    label: 'Defending', 
    short: 'DEF', 
    Icon: Shield, 
    color: '#2563eb', 
    bgColor: '#dbeafe',
    desc: 'Interceptions & Slide Tackling' 
  },
  { 
    key: 'phy', 
    label: 'Physicality', 
    short: 'PHY', 
    Icon: Dumbbell, 
    color: '#ea580c', 
    bgColor: '#ffedd5',
    desc: 'Jumping, Stamina & Strength' 
  }
];

export const STAT_DESCRIPTIONS = {
  ovr: 'Overall Rating',
  pac: 'Pace / Speed',
  sho: 'Shooting Power',
  pas: 'Passing Accuracy',
  dri: 'Dribbling & Skill',
  def: 'Defensive Tackle',
  phy: 'Physical Strength'
};
