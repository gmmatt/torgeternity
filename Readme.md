**Torg Eternity System** for Foundry VTT.  


## Installation

**Manifest URL**: https://github.com/gmmatt/torgeternity/releases/latest/download/system.json

For manual installation, use the provided manifest URL in the "*Install System*" popup window 
while managing game systems.

v. 0.92.5
- Updated threat sheets so that effects can be managed for threats
- NOTE: Armor effects should be inactive or deleted for threats since their toughness/
  armor needs to be entered manually on their sheets. 
- Updated an issue where some text was appearing as white instead of black.
- Fixed a bug where modifiers weren't displaying correctly in rolls from chat cards
- NEW FEATURE! Each map can now be designated with a cosm and zone type on the map
  configuration screen. Hover over the cosm icon to see the table tent for the current
  cosm
- Dice rolls/roll totals now display as a part of the roll result chat message instead
  of as a second message.

v. 0.92.4
- New Feature! Party sheet with summary of each player's stats.
- Fixed an issue where ammo current/max was not displaying properly in item drop-downs
- Updated localization
- Updated vehicle sheet so toughness can accommodate text input
- Updated journal frame to remove overlap between text and frame when sheet is resized
- Added back save button to journal window
- Added AP stat to heavy weapons
- Added setting that allows users to activate/deactivate animations of chat messages

v. 0.92.3
- Combat tracker update - multiple customizations to combat tracker. You can now sort
combatants by heroes/villains. Conditions for each combatant now shown. Combatant can
be checked off once they have finished their turn.
- New entity called "Custom Attack." You can now specify an attack that rolls any skill
and returns either flat damages or damages based on any chosen attribute-plus-bonus.
- Changed some fonts in UI; updated UI appearance
- Fixed an issue where some sheets creted under very early versions of the TE system were
not correctly displaying attributes on SK sheets.
- Fixed an issue where spells were not rollable.
- Updated appearance of threat sheets.
- Draggable macros! Players can drag any perk, gear, weapon, power, etc. onto the macro
hotbar for easier access during play. (Thanks again, @rwan for this and the combat tracker
update!)

v. 0.92.1

Various bug fixes and some additional UI enhancements. Added data structure to some
items and reorganized some of the item windows to accommodate additional data structure.
Added ability to track ammo by treating ammo as a resource (current/max). NOTE: sorry,
everyone, but you are going to lose the data in your ammo field in existing weapons sheets. You'll 
need to re-input the max ammo for any existing items. We will try to avoid doing this
much, if any, in the future.

Updated appearance of journal entry windows.

Known issue: some sheets that were created with a VERY early version of the system may
display the attributes window improperly on the Storm Knight sheet. We haven't tried
to fix this because we assume there aren't many sheets like that floating around out
there. But if it is an issue for you, let us know. We can fix it.

v. 0.92.0

Major user interface update! We have completely revamped all of the sheets (thanks much
to @rwanoux for all his hard work to get this done!).  

NOTES FOR v. 0.91.0
We have added support for active effects! These effects are available for each Storm Knight
and for any items attached to Storm Knights. Active effects allow you to modify the base
statistics for Storm Knights. They are most useful for adding armor and defenses, but
can also be used to modify skill values, attributes, and other related statistics. To apply
an active effect from an item (such as a piece of armor), create or edit the armor from
the items tab and add a passive effect that mirrors the abilities of the item. Then, drag
and drop it onto the chracter sheet (note that Foundry does not currently support editing
active effects within items once they are attached to a character, but you can still edit
the effect on the character's "Effects" tab). For a list of Storm Knight statistics 
that can be modified, see https://github.com/gmmatt/torgeternity/wiki/Storm-Knight-Data-Elements.

## License

Copyright (c) 2021 VTT Southwest, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction for any non-commercial purpose, 
including without limitation the rights to use, copy, modify, or merge,the 
Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The copyright claim above extents only to original content and original
components of this software. No copyright claims are made with respect to 
Torg, Torg Eternity, or any content that is a part of the Torg Eternity 
RPG system published by Ulisses Speile. 

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---
This work is based on Torg eternity system published by Ulisses Spiele
 (https://www.ulisses-us.com/games/torg/). This work is provided by fans 
 and is not endorsed by Ulisses Spiele.
