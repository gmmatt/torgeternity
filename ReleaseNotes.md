Release System

1. Change version number in system.json (Major.NewFeature.Bugfix)  
   1.1 as you are in the system.json file, you need to change the folder to the appropriate version number in the
   "download" object
1. Make sure readme is up to date.
1. Check if foundry loads
1. Close Foundry, if necessary reverse pack changes
1. Create a torgeternity.zip file, EXCLUDING:

- .lock file
- .git folder
- .vscode folder
- node_modules folder
- .gitignore file
- merge-upstream file

6.  Go to github, click on "Releases"  
    6.1 "Draft new release" Button  
    6.2 Choose a tag exactly like the version number, example: "3.1.4"  
    6.3 select the master branch as release branch  
    6.4 Add a description (copy & paste the readme snippet for that version)  
    6.5 Add the zip file and the system.json file

Release Module

(1) In the module.json file, change "protected" to true  
(2) Increase the version number  
(3) Move all of the module files into a zip file with the same name as the module folder  
(4) Use the Foundry content creator upload tool to upload the zip file  
(5) Change the "protected" element back to "false" in module.json  
(6) Push the changes

If you don't have access to the content creator tool, ask Jan or someone in the content creator channel on Torg foundry
and they can get it for you.

This is one is much easier than doing a system update, once you get the hang of it.
