/**
 * Initial Scaffold Data
 * Pre-defined areas and locations for the Journey/Adventure theme
 */

import type { Area } from '../types';

export const INITIAL_AREAS: Area[] = [
  {
    id: 'home',
    name: 'Home',
    letterCount: 3,
    locations: [
      { id: 'home-bedroom', name: 'Bedroom', areaId: 'home' },
      { id: 'home-kitchen', name: 'Kitchen', areaId: 'home' },
      { id: 'home-backyard', name: 'Backyard', areaId: 'home' },
      { id: 'home-garage', name: 'Garage', areaId: 'home' },
      { id: 'home-mailbox', name: 'Mailbox', areaId: 'home' },
    ]
  },
  {
    id: 'forest',
    name: 'Forest',
    letterCount: 4,
    locations: [
      { id: 'forest-trail', name: 'Trail', areaId: 'forest' },
      { id: 'forest-clearing', name: 'Clearing', areaId: 'forest' },
      { id: 'forest-stream', name: 'Stream', areaId: 'forest' },
      { id: 'forest-cabin', name: 'Cabin', areaId: 'forest' },
      { id: 'forest-campfire', name: 'Campfire', areaId: 'forest' },
    ]
  },
  {
    id: 'desert',
    name: 'Desert',
    letterCount: 5,
    locations: [
      { id: 'desert-oasis', name: 'Oasis', areaId: 'desert' },
      { id: 'desert-canyon', name: 'Canyon', areaId: 'desert' },
      { id: 'desert-dunes', name: 'Dunes', areaId: 'desert' },
      { id: 'desert-ruins', name: 'Ruins', areaId: 'desert' },
      { id: 'desert-sunset', name: 'Sunset', areaId: 'desert' },
    ]
  },
  {
    id: 'mountains',
    name: 'Mountains',
    letterCount: 6,
    locations: [
      { id: 'mountains-basecamp', name: 'Basecamp', areaId: 'mountains' },
      { id: 'mountains-waterfall', name: 'Waterfall', areaId: 'mountains' },
      { id: 'mountains-cave', name: 'Cave', areaId: 'mountains' },
      { id: 'mountains-summit', name: 'Summit', areaId: 'mountains' },
      { id: 'mountains-lodge', name: 'Lodge', areaId: 'mountains' },
    ]
  },
  {
    id: 'ocean',
    name: 'Ocean',
    letterCount: 7,
    locations: [
      { id: 'ocean-beach', name: 'Beach', areaId: 'ocean' },
      { id: 'ocean-reef', name: 'Reef', areaId: 'ocean' },
      { id: 'ocean-shipwreck', name: 'Shipwreck', areaId: 'ocean' },
      { id: 'ocean-lighthouse', name: 'Lighthouse', areaId: 'ocean' },
      { id: 'ocean-island', name: 'Island', areaId: 'ocean' },
    ]
  },
  {
    id: 'space',
    name: 'Space',
    letterCount: 8,
    locations: [
      { id: 'space-launchpad', name: 'Launchpad', areaId: 'space' },
      { id: 'space-station', name: 'Station', areaId: 'space' },
      { id: 'space-asteroid', name: 'Asteroid', areaId: 'space' },
      { id: 'space-nebula', name: 'Nebula', areaId: 'space' },
      { id: 'space-planet', name: 'Planet', areaId: 'space' },
    ]
  }
];
