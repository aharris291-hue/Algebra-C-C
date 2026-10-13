# Troubleshooting

For the family. Every fix below keeps the student's progress unless it says otherwise. When in doubt, **save a backup first** (Parent Mode → Backup & security → *Save a backup file*).

**Folders** (paste into the File Explorer address bar):

| What | Where |
|---|---|
| Student data | `%APPDATA%\Algebra C&C Learning Academy\data\academy.sqlite` |
| Previous save | `...\data\academy.sqlite.prev` |
| Daily automatic backups (the 14 most recently written, one per day, also while the app stays open) | `...\data\backups\auto\` |
| Safety backups (made before a restore or an upgrade) | `...\data\backups\safety\` |
| Log file (no names, answers or PINs) | `%APPDATA%\Algebra C&C Learning Academy\logs\app.log` |

Parent Mode → Backup & security → *Open data folder* opens the data folder directly.

## Installing

**"Windows protected your PC" when running Setup.exe.**
The installer is not code-signed, so SmartScreen does not recognize the publisher. Click **More info**, then **Run anyway**.

**The installer finished but there is no Desktop icon.**
The Desktop shortcut is optional during setup. Use the Start Menu: type *Algebra C&C*. Running Setup.exe again lets you add the shortcut.

**Updating to a new version.**
Run the newer Setup.exe. There is no need to uninstall first. Progress is kept. If the data needs upgrading, a safety backup is made first, in `data\backups\safety\`.

## Starting the app

**"The app could not start."**
1. Restart the computer and try again.
2. Reinstall by running Setup.exe again. Reinstalling never touches student data.
3. If it still fails, the reason is in `logs\app.log`. The last lines that mention `startup` describe the problem.

**"This data was saved by a newer version of the app."**
An older version was installed over a newer one. Install the newest Setup.exe again. Older versions cannot read newer data, and the app refuses rather than risk damaging it.

**"The student data could not be opened." (no readable copy was found)**
On every start the app tries, in order: the current save, an interrupted save, the previous save, then each daily backup, newest first. This message means none of them could be read. Parent Mode cannot open without data, so the message itself offers three buttons:
1. **Restore from a backup file…**: choose a `.accbackup` file (for example from a USB drive). It gets the same checks as a restore in Parent Mode; if it fails, nothing is changed and you can choose another file. After a restore the Parent PIN is the one set when the backup was made.
2. **Start fresh**: the app starts with empty progress and first-time setup (it asks you to confirm first). You can still restore a backup file later in Parent Mode.
3. **Quit**: nothing is changed. Send `logs\app.log` and the whole `data` folder to whoever supports the app.

Restoring and starting fresh never delete the unreadable files: they are moved, unchanged, into a folder named `unreadable-<date and time>` inside the `data` folder (daily backups into its `auto` subfolder). Keep that folder until everything looks right.

**"The student data could not be updated for this version of the app."**
An upgrade step failed. Nothing was changed: the data is still as it was, and a copy was saved in `data\backups\safety\pre-migration-...` first. Reinstall the previous version, or send `logs\app.log` to whoever supports the app.

**A yellow banner says the app "restored your progress" from an earlier save.**
The newest save was damaged, probably by a power cut or a crash while saving, and the app recovered automatically. At most the last few answers are lost. The damaged file is kept as `academy.sqlite.corrupt-<number>`, for diagnosis. You can delete it once everything looks right.

**A red banner says "Your latest progress could not be saved to disk".**
The disk is full, the data folder is read-only, or another program has locked the file (often a cloud-sync or antivirus tool). The banner appears within seconds of a failed save.
1. Free some disk space.
2. Exclude the data folder from real-time sync or scanning.

The app keeps the work in memory and retries the save automatically (after 1, 2, 5, 10, then every 30 seconds). The banner disappears by itself once a save succeeds. If it does not, save a backup file in Parent Mode, then restart the app. Avoid closing the app while the banner is showing.

**"Another active student is already named ..."**
Two active students cannot share a name, so nobody opens the wrong profile. Rename one of them (Parent Mode → Students & goals) before restoring an archived profile with the same name.

**"This is not a valid Algebra C&C Academy backup".**
The file has the right shape but its data does not match this app (for example a damaged or hand-edited file). Nothing was changed. Try another backup file, such as a daily automatic backup.

## Parent PIN

**Forgot the Parent PIN.**
Open Parent Mode → *Forgot the PIN?* and enter the recovery code from setup. You choose a new PIN and get a new recovery code; write it down.

**"Parent Mode is locked for N seconds."**
After 5 wrong PINs, Parent Mode locks for 1 minute. The lock doubles with each further wrong try, up to 32 minutes. Wait, then try again, or use the recovery code. Learning is not affected while Parent Mode is locked.

**Lost both the PIN and the recovery code.**
Parent Mode cannot be opened without one of them. This is deliberate, so a student cannot change grades or goals. The student can keep learning normally.

To start over with a new PIN, close the app, then rename the `data` folder (for example to `data-old`). The next launch runs first-time setup with empty progress.

The old progress is not deleted; it stays in `data-old`. To bring it back, rename the folders back. It still needs the old PIN.

## Learning

**An answer I know is right was marked wrong.**
- Check that the answer is in the form the question asks for. Examples: "simplest radical form", "write the inequality with x by itself", "round to the nearest hundredth".
- Fractions and terminating decimals are both accepted, and mixed numbers like `3 1/2` are accepted. Repeating decimals are not exact, so type them as fractions.
- If it still looks wrong, note the lesson and the problem text. Every problem's numbers can be reproduced from the record, so it can be checked and fixed.

**"Something went wrong on this screen."**
A screen hit an unexpected error. Work is saved as the student goes, so nothing is lost: choose **Return to dashboard** (or **Reload the app**) and carry on. The error is written to `logs\app.log` (lines tagged `[renderer]`, without names or answers); send that file to whoever supports the app if it keeps happening.

**Can the student skip ahead or work out of order?**
Yes. Every lesson, review, project and assessment is open from the start and can be done in any order (nothing is locked). The course map marks the **Suggested next** day, the first day not finished yet, and "Continue learning" on the home screen goes there. **Show What You Know** lets a student skip a lesson with credit. If the student leaves a quiz or assessment to look at a lesson, the quiz or assessment stays saved where it was left; the parent sees "left to view lessons" with that result in Parent Mode. It never changes the score.

**The diagnostic is gone from the home screen.**
It disappears once it has been taken or skipped. A parent can offer it again: Parent Mode → Students & goals → *Offer it again*.

**Study time looks low.**
Only learning time counts: time in a lesson, on a review, assessment or project day, in the diagnostic, or in practice. Time on the dashboard, course map, skills list or settings is not study time and does not count toward the daily goal or the streak. Time also counts only while the app window is visible and the student has used the keyboard or mouse in the last 90 seconds. Time spent with the window minimized or idle is not counted.

**"The Parent PIN was just changed."**
A Parent Mode screen was still using the old PIN. Leave Parent Mode and open it again with the new PIN. This never counts as a wrong PIN.

## Moving to a new computer

1. On the old PC: Parent Mode → Backup & security → *Save a backup file*. Copy the `.accbackup` file to a USB drive or cloud folder.
2. On the new PC: install with Setup.exe and do the first-time setup. The PIN can be anything, because the restore brings back the old one.
3. Open Parent Mode → Backup & security → *Choose a backup file…* and confirm.

After the restore, the Parent PIN is the one from the old computer.

## Uninstalling

Windows Settings → Apps → *Algebra C&C Learning Academy* → Uninstall. Student data is kept in `%APPDATA%\Algebra C&C Learning Academy`. To remove everything, delete that folder after uninstalling. Save a backup first if the progress might be wanted later.
