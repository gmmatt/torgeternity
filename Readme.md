**Torg Eternity System** for Foundry VTT.  


## Installation

**Manifest URL**: https://github.com/gmmatt/torgeternity/releases/latest/download/system.json

For manual installation, use the provided manifest URL in the "*Install System*" popup window 
while managing game systems.

v. 1.1.5
- Added custom Torg Eternity dice that are compatible with the Dice So Nice module.
- Added Basic Rules compendium - these are not the official rules, but an informal set
  of quick start rules that can be substituted in their place for those who want to 
  try out the game. 

v. 1.1.4
- Fixed an issue where PC character descriptions weren't displaying properly
- Fixed an issue where heavy weapon descriptions weren't displaying properly
- Added a new generic profile for threats, which should appear in Core Rulebook and
  other official releases. You can also use it (point to systems/torgeternity/images
  /icons/threat.webp)

v. 1.1.3
- Fixed an issue where descriptions of enhancements and vehicles weren't displaying
  properly.
- Fixed an issue where character sheet-based BD rolls weren't triggering animation
  in the DiceSoNice module.

v. 1.1.2
- Added button in special abilities window to convert to rollable special ability
- Converted bonus damage rolls to standard Foundry rolls

v. 1.1.1
- The base attribute for each skill on Storm Knights can now be changed
- Updates Spanish localization (thanks again Forja)
- "Other" Cosm type is now available
- Axioms for Storm Knights can now be edited. However, edits will only allow changes
  for "other" cosm types. Use effects on perks, etc. to change axioms in main cosms.
- Fixed an issue where descriptions of special abilities and rollable special abilities
  weren't displaying properly

v. 1.1.0
- Updated functionality for Foundry v. 0.8.x
- Changed character sheet backgrounds to allow for more contrast with text (thanks Forja!)
- Updated Spanish localization (thanks again Forja!)
- Updated player list UI so that GM can take and give possibilities to players
- Re-worked parts of the combat tracker; most of the changes are under the hood
- Fixed a bug where NaN error was displaying when clicking on attributes
- Known Issue: Threats are loading a little more slowly than they should. We are looking 
  into this.

v. 1.0.0
- Welcome to version 1! Thanks to everyone who has contributed through the testing
  of our Beta builds!
- We are excited to now be the official Foundry system for Torg Eternity!
- All cards from the core Drama Deck are now available as part of the TE system. 
- All 16 original/core archetypes for Torg Eternity are available in a compendium
- Token bars now begin filled/green when you have 0 wounds or shock and deplete
  as you take more wounds/shock (the default was a little counterintuitive so
  we changed it)
- Updated active defense checks  so they work more like skill, weapon, and power checks.
- Fixed an issue where NaN results were displaying when clicking on certain parts of skill line

v. 0.92.5
- Updated threat sheets so that effects can be managed for threats
- NOTE: Armor effects should be inactive or deleted for threats since their toughness/
  armor needs to be entered manually on their sheets. 
- Updated an issue where some text was appearing as white instead of black.
- Fixed a bug where modifiers weren't displaying correctly in rolls from chat cards
- NEW FEATURE! Each map can now be designated with a cosm and zone type on the map
  configuration screen. Hover over the cosm icon to see the table tent for the current
  cosm (thanks again Rwan!)
- Dice rolls/roll totals now display as a part of the roll result chat message instead
  of as a second message.
- Fixed a bug where attribute names weren't appearing on threat rolls.

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

This system is produced by VTT Southwest, LLC under license from Ulisses Spiele.

All Torg Eternity content is Copyright (c) 2017, 2021 Ulisses Spiele. Torg: The Possibility 
Wars and all unique characters, concepts, locations, and creatures are trademarks and/or
copyrights of Ulisses Spiele. All rights reserved.

All components of this software that are not subject to the above trademarks and copyrights of 
Ulisses Spiele are Copyright (c) 2021 VTT Southwest, LLC. Permission is granted to use the 
system and to make modifications to the system so long as the system is used within the Foundry 
VTT enviornment.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

