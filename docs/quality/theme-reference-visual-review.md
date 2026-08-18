# Theme reference visual review

## XP/Luna review

The XP desktop capture confirms the intended original blue-sky/green-horizon hierarchy without using the reference wallpaper. The blue taskbar has a glossy layered surface, a green rounded Start control, distinct task-button and tray zones, and white-shadowed desktop labels. The open Start menu confirms the new user header and a clear two-pane information hierarchy: application launchers remain on white, while profile and settings actions occupy a light-blue system pane. The supplied XP My Computer icon is visible only in its system-adjacent launcher role; original portfolio icons remain the desktop identity system.

The capture does not include a windowed app because the review focuses on the shell and Start-menu states. Window, Explorer, WordPad, Guestbook, and Control Panel styling are covered by source review and automated browser regression in the subsequent validation phase.

## Windows 98 review

The corrected Windows 98 capture confirms the flat teal desktop, compact grey taskbar, square Start button, and inset system tray. It also exposed an integration conflict with the runtime Windows 98 stylesheet: its generic button rule was applying raised button chrome to every desktop icon. The next small correction explicitly neutralizes that generic chrome for desktop launchers so only a selected label or keyboard focus state receives the classic selection treatment.

After neutralizing the generic button rule, the final Windows 98 desktop capture shows unframed desktop launchers on the teal field, compact label spacing, and a true grey classic taskbar. The final Start-menu capture shows the vertical 2000sme rail, square 3D control bevels, narrow two-column menu structure, dotted keyboard focus treatment, and a limited Windows 98 My Computer system icon. This pass now reads as a distinct classic Windows 98 system rather than an XP palette variation.
