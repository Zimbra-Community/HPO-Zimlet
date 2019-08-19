# HPO-Zimlet
High performance meeting Zimlet

This Zimlet changes the New Appointment dialog and default meeting duration option in Zimbra to be able to do High Performance Meetings. 
https://www.oxfordleadership.com/characteristics-high-performing-team-meetings/

      su zimbra
      wget https://github.com/Zimbra-Community/HPO-Zimlet/releases/download/0.0.5/tk_barrydegraaff_performance_meeting.zip -O /tmp/tk_barrydegraaff_performance_meeting.zip
      cd /tmp
      zmzimletctl deploy /tmp/tk_barrydegraaff_performance_meeting.zip

![UI](https://github.com/Zimbra-Community/HPO-Zimlet/raw/master/docs/New%20appointment%20UI.png)
![Default duration](https://github.com/Zimbra-Community/HPO-Zimlet/raw/master/docs/Default%20durations%20added.png)

It is suggested you disable the Quick-Add appointments in the COS:
![Suggested COS setting](https://github.com/Zimbra-Community/HPO-Zimlet/raw/master/docs/Disable%20quick-add.png)

