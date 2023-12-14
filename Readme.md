**Torg Eternity System** for Foundry VTT.  


## Installation

**Manifest URL**: https://github.com/gmmatt/torgeternity/releases/latest/download/system.json

For manual installation, use the provided manifest URL in the "*Install System*" popup window 
while managing game systems.

v. 3.3.0
 * If a Storm Knight is deleted, the appropriate hand will be deleted as well.
 * The combat tracker now behaves like it should for TE: All players now have the "Done" button displayed. If a player clicks it, the GM's combat tracker will be updated with a checked checkmark at the apropriate character. However, to end the round is totally up to the GM.
 * New possibilities by cosm window! Click on "Possibilities" on your character sheet, a new window will open to help keeping you track of cosm-specific possibilities. Players can hit the key "P", as this bound for opening this window as well.  If the apropriate premium module is active, clicking the title of the cosm-possibility will open the journal entry for quick rule reference.  **PLEASE NOTE:** This won't have any impact on the system's behaviour, it's just for your convenience for accounting purposses.
 * The skill "Missile Weapon" is now correctly ordered in the combat section.
 * Storm Knights can actively defense- so why can't threats? Now, threats as well can defend themself actively.

v. 3.2.2
 * Fixing a bug, that set the possibilities automatically on 3 when 0 is reached.

v. 3.2.1
 * introducing system.other.moveMod and system.other.runMod as new Dataelements for active effects on move and run (check out the [wiki](https://github.com/gmmatt/torgeternity/wiki/SK-Data-elements-after-3.0.4) as well)
 * Fixing vehicles for possibility spendage (the one who clicked is the one who pays ;) )
 * Scene configuration is up to date with all the elements you know from other systems

v. 3.2.0
 * A new Wiki with data elements is found [here](https://github.com/gmmatt/torgeternity/wiki/SK-Data-elements-after-3.0.4)
 * Possibility handling!
   * When "Possibility" is clicked on the chat card, the amount now is substracted from the aproprieate character
   * A possibility now is removed on a soak roll
   * If you are about to spend your last possibility, you're asked if you're really sure about that. At last, you could need it otherwise...
   * A warning is now produced, if there are no possibilities left
   * However, if a GM wants to grand you a possibility (there are moments, when heroes are needed!), the GM can click on "Possibility" on your chat card to produce a possibility roll
 * The law of action!
   * If on a scene are the cosms "None", "Other" or "Nile Empire" set, the mechanics for the law of action are principle possible to trigger. This means that you can click on "Possibility" twice, and the best result is chosen.
     We decided to take the "None" and "Other" cosm choice to be placed in this mechanics as well for GMs who are more playing a theatre of mind or don't want to configure cosms on their scenes.
 * CusomSkills are now "favorable".
 * Default defence detection now takes place, so by attacking with Melee or Unarmed, the default defence will search for a melee weapon equipped by the defender. If there is none, well, it's up to unarmed!
 * The party sheet can now be opened in 2 modes: Either you'll be shown all your players, or just these who are online. You'll be asked for a "yes" or "no" decission.

v. 3.1.3
 * Bug Squashing:
   * If the current wounds value is empty, it needs to be checked as well, setting the modifier to 0 (#280)
   * Getting power's DN from the item DN combobox if there's no target selected (#82)
   * Resolving the scrolling issue with an docked-in combat tracker (#271)
 * Setting Skill list entries to a min-height of 25px (necessary for custom skills)
 * New splash

v. 3.1.2
 - Fixed a bug where wounds gave negative modificators in their amount, though it can't be more as -3
 - Gave the journal compendiums some rethinking.
 - Changed item's avatar pictures
 - took out the .lock file from the .zip file
 
v. 3.1.1
 - Fixed broken compendiums after merge / release

v. 3.1.0
 - Included a new damage handling on chatcards (thanks to Durak)
 - More localisation

v. 3.0.1
 - Update internal databases
 - Add ES functionality to hide compendiums option - now ES hides DE and FR compendiums,
   but EN is still available
   
v. 3.0.0
 - New NPC sheet!
 - You can now use interaction attacks from NPC sheet
 - You can specify interaction skills as defensive only
 - To edit, hit the edit button the Skills section
 - Fixed problem with stymied and vulnerable conditions not applying (thanks Durak!)
 - Effects applying to attributes now alter corresponding skills as well (thanks again Durak!) 

v. 2.9.3
- Fixed issue where skills and attacks couldn't be rolled from unlinked tokens in v11
- Cards are removed from player pools when GM ends combat encounter
- Fixed issue where Torg icon was not aligning in left custom menu
- Many thanks to Durak who was mostly responsible for the changes in this patch!
- Removed option for animated chat cards - it was causing formatting issues in some system
  installations.

v. 2.9.2
- Fixed issue where "Hide Foreign Compendium" setting was broken (thanks for the help Durak!)

v. 2.9.1
- Version 11 compatibility!
- Fixed problem in 2.9.0 with database compatibility
- Fixed display issue on vehicles in version 11 
- Update scene navigation for version 11 (many thanks to @mxzf on the Foundry Discord
  for assistance with this issue, as well as the system migration issue)
- Migrate system databases to v11
- Repaired Destiny Card 42 (en)
- Updated magic axiom for new Cyberpapacy characters (15 to 14)
- Updated alignment issue for custom skills
- Add warning for users of automatic damage feature
- Eliminate obsolete compatibility warnings
- Updates to de.json (thanks Algor!)
- Update pilot section (Algor)
- Updates to journal (Algor)

v. 2.8.3
- An option now allows player hands to open at the bottom/right of the screen.
  When this option is checked, cards appear above the player hand window.

v. 2.8.2
- Updated Destiny Card 42 (EN) so that it is correctly named
- Updated magic axiom for Cyberpapacy characters from 15 to 14
- Corrected an alignment issue for custom skills
- Added warning re automatic damage feature not correctly applying subsequent BD rolls

v. 2.8.1
- Fixed issue involving inability to target threat skills

v. 2.8.0
- Added new actor template for vehicles

v. 2.7.2
- Fixed issue involving resetting possibilities in player list
- Formatting updates test chat output
- Cards should now remain pooled when passed to other players
- Additional options for hiding official compendiums

v. 2.7.1
- Fixed issue where foreign compendiums would not hide when
  using the Compendium Folders module
- More automation for shield users - toughness bonus now
  automatically increased when actively defending (thanks Durak!)
- The player sheet is back! (Thanks, Rwan!)
  
v. 2.7.0
- Fixed multiple compatibility warnings

v. 2.6.9
- Fixed issue where tooltips for cards in chat were broken
- Multiple localization improvements
- Drag n Drop Macros for Threats (Thanks Spatula!)
- Enriched text now available on all items and actors

v. 2.6.8
- Fixed issue causing buff effects on attributes to fail to 
  reset on close.
- Fixed issue where threats could not be edited
- Multiple updates to item and actor sheets to ensure compatibility
  with version 10
- Armor/shield equip/unequip icon on Gear page now turns associated
  Effects on/off
- Fixed issue where chat hyperlinks did not work when actively
  defending

v. 2.6.7
- Fixed issue where some fields on threats could not be edited

v. 2.6.6
- Fixed issue where Storm Knight attribute edits didn't stick
- More chat and hotbar enhancements from Spatula!

v. 2.6.5
- Fixed issue in 2.6.4 where drop-downs did not work in item sheets
- Fixed issue where chat message displaying item description was not
  working
- Drag n Drop macros are back, baby! Many thanks to Spatula for helping us 
  get them going again in v10!

v. 2.6.4
- Fixed issue where scene backgrounds could not be created/changed
- Fixed issue where enriched text does not appear in some item descriptions
- Fixed issue where macros could not be dragged onto hotbar or rearranged
- Note: Torg Eternity drag/drop macros from character sheet are
  disabled. We hope to restore them in the future. 
- Disabled custom player list extension until it can be updated for v10

v. 2.6.1, 2.6.2, and 2.63
- Changed verified version to hopefully improve Forge compatibility
- Changed "name" to "id" in manifest to improve Forge compatibility

v. 2.6.0
- Our first release under Foundry, version 10!
- A handful of updates, but most of the changes relate to v10
  compability
- You will get some v10 compatibility warnings in the console.
  These will be resolved in the coming weeks.

v. 2.5.1
- Fixed issue with card images in system (thanks BadIdeasBureau!)
- Updated archetypes (known issue: archetype powers still not updated
  to new data structure) (thanks Helmut/Algor!)
- Added French compendiums (thanks Rwan!)
- Added new perk categories from Orrorsh and Pan Pacifica books
- Renamed "Ki Powers" to "Vitality" per Pan Pacifica backer preview

v. 2.5.0
- From Durak: When rolling for active defenses, an Active Effect
  is created that modifies those defenses.
- Substantial overhaul of skill check system. The system is now
  streamlined to create a consistent skill test experience. No
  need to shift-click to get test to account for targets.
- Attack-type powers now work as attacks versus targets, and calculate
  damage.
- Powers are now listed below attacks on main page of character sheet
- We have migrated all card images to webp format. Thanks to BadIdeasBureau
  your custom decks that rely on images in the core system or published
  modules should also migrate to the new format.

v. 2.4.4
- Fixed bug that prevented entry of threat data

v. 2.4.3
- Fixed issue with defenses improperly calculating on sheet and
  in attacks
- Updated sheet styling so that expandable skills do not change
  size of other sheet elements.
  
v. 2.4.2
- Fixed bug where defenses were not calculated in 2.4.1
- User experience with cards improved even more thanks to BadIdeasBureau
- More French localization goodness, thanks to Rwan

v. 2.4.1
- Card settings and world setup working much smoother now thanks to 
  Rwan and BadIdeasBureau.
- Under the hood, deck identifications are getting handled much
  more elegantly thanks to BadIdeasBureau. 
- Also thanks to Bad, we localization of decks is a lot easier.

v. 2.4.0
- Updated enhanced checks to include disfavored rolls
- Attack rolls now allow user to select defense used
- Integrated code from Chain Reaction module so that exploding
  dice now operate in tandem with TE rules
- Lots of CSS to make journal entries look more Torg-Like
- Integrated "Session Zero" on EN and DE compendiums as a bonus

v. 2.3.9
- Fixed bug from last two releases that caused problems with
  updating threat skills

v. 2.3.8
- Fixed bug from 2.3.7 that caused all threats to have 3 wounds
- Fixed bug from 2.3.7 that caused effects (such as armor) to not be applied
- IMPORTANT: ALL CATEGORIES ON THE NEW CARD SETTINGS SCREEN SHOULD
  POINT TO A DISTINCT DECK, STACK, OR HAND IN ORDER FOR THE CARDS
  SYSTEM AND COMBAT TRACKER TO WORK CORRECTLY. Most bugs that users
  experienced in 2.3.7 could be traced back to duplicate or broken
  settings. We will work on creating a smoother, and less problematic
  integration for these settings in upcoming releases.

v. 2.3.7
- New GM screen interface - be sure to update your Living Land and
  Core Rulebook modules before using this feature.
- Hotkeys for GM Screen ("G") and player hands ("H")
- Fixed issue where interactions with no adds would not properly
  generate an interaction attack.
- Threat interface improvements. Expand the threat window to edit
  the threat's statistics and access its tabs. Collapse the threat
  window to work with a compact stat block.
- Beta Feature - (use with caution!): you can now automaticlaly apply
  damage to targets. Check the box in the system settings menu to
  enable this feature.
- Thanks to Rwan for the improvements in this update!

v. 2.3.6
- Fixed issue where player hand cosm button was drawing Destiny
  cards instead
- Multiple enhancements to drag n drop macros, thanks to Spatula!
- Better default permissions on various discard piles (also thanks to
  Spatula!)
- You can now select the decks that are used for various game functions,
  rather than always being forced to use the defaults (thanks Rwan!)
- Lots of other changes made to journals, formatting, localization, etc.
  to make things smoother for multi-language play and module releases
  (Algor has been working tirelessly on all of this, thanks!)

v. 2.3.5
- Added "life-like" hand option in player hand window (amazing work,
   Rwan!)
- From Spatula (thanks!): drag-drop skill macros for players
- Intimidation attacks now target Spirit instead of Charisma
- Fixed Active Defense functionality

v. 2.3.4 
- Added support for Monarch cards module (thanks to LordZeel for all his
  work! It looks amazing)
- Adjusted location of tool tips in sidebar
- Multiple updates to journal styling (thanks Algor!)
- Updates to German basic rules
- Corrected an error relating to the template for the Faith skill
- Known issue: clicking Defenses does not roll active defenses

v. 2.3.3 - Squashing Bugs
- Fixed issue where item macros could not be created
- Fixed multiple issues involving player combat trackers either
  generating errors or not updating correctly
- (Confirmed that perk categories should not reset again after
  this update nor should they reset after future updates)
- Fixed issue where possibilities were not updating when GM
  uses player bar
- Enhancements and Limitations tabs now available for all perks
- Added German compendiums and ability to hide English/German compendiums
  (many thanks to Algor for his work to get this added!)
- Fixed drag-and-drop attack macros so that they now work properly
  (thanks for the contribution, Durak!)

v. 2.3.2 - Pulp Powers Update
- Updated perk types for all official releases to date (thanks @fscx!)
- Updated perk data structure and perk item screen for pulp powers. Now,
  when you set up a pulp power item, you get two more tabs where you can
  create, select, and edit enhahcements and limitations.
- Fixed a bug where skill test chat buttons didn't work while animated 
  chat was turned off
- Changed base fatigue to 2 (facepalm!)
- Clarified error message displayed in combat tracker when there is no
  matching hand for a Storm Knight
  
v. 2.3.1 - Cards Permissions Patch
- Multiple changes to the way default permissions on cards are handled

v. 2.3.0 - Character QoL Update
- Added custom skills (create/edit them in Perks tab). Known issue: custom 
  skills cannot be flagged as favored.
- Added AP stat to rollable special abilities
- Added chat notes for output with weapon attacks (keep these brief or you'll
  clutter your chat log!)
- Added fatigue to character sheet. Fatigue effects can now be added to armor.
- Click on Fatigue label on sheet to automatically increase shock

v. 2.2.0 - Dramatic Skill Resolution Trackers
- Fixed bug where Blind Fire was not evaluated in attack rolls
- Multiple additional status effects
- Added effects to rollable special abilities (Note: as a general rule, 
  threats should be set up as static entities, so use sparingly)
- Updated scene configuration so it is consistent with Version 9
- Fixed bug where secondary cosm was available in dominant zone scenes
- Fixed issue where combat tracker height was not adjusting properly in 
  popouts
- Added DSR counter to combat tracker and to individual combatants
- Updated the Basic Rules based on changes in version 2

v. 2.1.1
- Fixed tab alignment issue in items
- Removed unofficial card support module dependency
- Updated Welcome message (revised for new version and removed outdated elements 
  from previous versions)
- Updated links dialog
- Update German localization (thanks Algor!)
- Fixed issue where card types were not localizing in configuration windows
- Changed titles of some threat tabs so that tabs format correctly
- Fixed issue where threat equipment lists weren't formatting correctly
- Improved formatting on background tab of Storm Knights

v. 2.1.0
- Added card support! Too many new features to document here, but you can
  see a demonstration video here: https://www.youtube.com/watch?v=D2VKq_JtJeI&t=227s

v. 2.0.5
- Update Spanish localization (thanks to ForjaSalve!)

v. 2.0.4
- Improved detection of defenses that are automatically set for 
  enhanced attacks.
- Corrected issue where concealment modifier is not detected.
- Added filter to attacks section and gears section so that empty categories
  are not shown.
- Added interaction attacks for Storm Knights.

v. 2.0.3
- Updated fr.json (thanks VieuxTroll!).
- Attempting Magic/Miracles/Psionics tests unskilled now generates a message 
  indicating that the test cannot be completed.
- Fixed an issue where enhanced missile weapon attacks were using Melee 
  Weapons/Unarmed Combat as a defense, rather than dodge.
- Added heavy burst to Rapid Fire options in enhanced attack tests
  

v. 2.0.1
- Added ability to edit AP on all weapons (previously only heavy weapons had
  the option for editing AP)
  
v. 2.0.0
- Enhanced skill test update! The new system includes multiple enhancements
  to the skill test system. Shift-click on any skill name or attack icon to
  get a dialog with options for your DN and various modifiers. After rolling,
  click on the "Modifiers" label in chat to update/change DN and modifiers.
- Added target size option to threats (this makes it possible for automation
  to take target size into account when calculating DNs)
- Remomved disabling of possibility button in skill test chat after first
  check. This enables spending more than one possibility on a test, where it
  is permitted (e.g., Nile Empire).
- Update Storm Knight sheet to make it easier to read
- Update Spanish localization (thanks to lozaljo and ForjaSalve)
- Removed gulpfile and scss dependencies. CSS should now be edited directly.

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

