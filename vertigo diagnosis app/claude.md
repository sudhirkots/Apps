\# CLAUDE.md



\## Project Behavior



You are working inside this project workspace.



Before making major changes:



\* Briefly explain the plan.

\* Prefer small incremental edits.

\* Avoid unnecessary rewrites.

\* Preserve existing architecture unless specifically asked to refactor.



\## Terminal Usage Rules



Use PowerShell only inside this project folder.



Automatically proceed with safe read-only commands such as:



\* ls

\* dir

\* pwd

\* Get-ChildItem

\* cat

\* type

\* find

\* grep

\* git status

\* git diff

\* reading files

\* searching code

\* listing folders



Do not repeatedly request approval for safe commands.



Ask permission before:



\* deleting files

\* overwriting important files

\* installing packages

\* modifying system settings

\* running external scripts

\* changing environment variables

\* pushing to GitHub

\* force git operations



\## Coding Style



\* Keep code modular and readable.

\* Prefer simple solutions over clever ones.

\* Comment only where necessary.

\* Avoid excessive abstraction.

\* Maintain compatibility with existing project structure.



\## Workflow



At session start:



1\. Read:



&#x20;  \* memory.md

&#x20;  \* project-guide.md

&#x20;  \* agents.md

&#x20;  \* skills.md

2\. Summarize current project state briefly.

3\. Continue from last unfinished task.



At session end:



1\. Update memory.md with:



&#x20;  \* what was completed

&#x20;  \* pending issues

&#x20;  \* next recommended steps

2\. Ask whether changes should be committed to GitHub.



\## Safety



Never:



\* access files outside the workspace unnecessarily

\* expose secrets or API keys

\* delete user data without confirmation

\* perform destructive git actions without permission



\## Communication Style



\* Be concise and practical.

\* Avoid repetitive explanations.

\* Focus on execution and progress.

\* If blocked, explain the exact issue clearly.

