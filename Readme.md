# **Torg Eternity System** for Foundry VTT.

## Performing the release on github:

1. Make sure Changelog is up to date.
1. Merge all commits for the release to master
1. Check if foundry loads with a checked out master
1. Go to github, click on "Releases"
   - "Draft new release" Button
   - Choose a tag exactly like the version number, example: "3.7.0"
   - select the master branch as release branch
   - Add a description (copy & paste the Changelog snippet for that version)

Release Module

(1) In the module.json file, change "protected" to true  
(2) Increase the version number  
(3) Move all of the module files into a zip file with the same name as the module folder  
(4) Use the Foundry content creator upload tool to upload the zip file  
(5) Change the "protected" element back to "false" in module.json  
(6) Push the changes

If you don't have access to the content creator tool, ask Jan or someone in the content creator channel on Torg foundry
and they can get it for you.
