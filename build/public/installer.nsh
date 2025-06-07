!macro customInit
  # Set installation directory to Program Files
  StrCpy $INSTDIR "$PROGRAMFILES\BitBon"
  
  # Create uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  # Add uninstall information to Add/Remove Programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BitBon" \
                   "DisplayName" "BitBon"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BitBon" \
                   "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BitBon" \
                   "DisplayIcon" "$INSTDIR\resources\app.ico"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BitBon" \
                   "Publisher" "Noel George"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BitBon" \
                   "URLInfoAbout" "https://github.com/NOL10/bitbon"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BitBon" \
                     "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BitBon" \
                     "NoRepair" 1
!macroend

!macro customUnInit
  # Remove registry entries
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BitBon"
  
  # Remove shortcuts
  Delete "$DESKTOP\BitBon.lnk"
  Delete "$SMPROGRAMS\BitBon\BitBon.lnk"
  RMDir "$SMPROGRAMS\BitBon"
  
  # Remove installation directory
  RMDir /r "$INSTDIR"
!macroend

Section "Uninstall"
  # Remove registry entries
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BitBon"
  
  # Remove shortcuts
  Delete "$DESKTOP\BitBon.lnk"
  Delete "$SMPROGRAMS\BitBon\BitBon.lnk"
  RMDir "$SMPROGRAMS\BitBon"
  
  # Remove installation directory
  RMDir /r "$INSTDIR"
SectionEnd 