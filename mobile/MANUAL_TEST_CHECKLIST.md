# Officer mobile manual test checklist

Use demo-only staging accounts and a disposable staging project with migrations through `006`. Never record tokens, PINs, exact coordinates, or personal information in test evidence.

## Authentication and authorization

- [ ] Valid badge/PIN logs in; invalid PIN shows a safe error.
- [ ] JWT exists only in Expo SecureStore and never appears on screen or in logs.
- [ ] Expired/invalid JWT produces 401, clears the secure session, stops tracking/polling, and returns to login.
- [ ] Logout clears the session and stops tracking/polling.
- [ ] Successful logout while on duty calls authenticated Stop Duty, waits for success, leaves the server OFF_DUTY, stops tracking/polling, clears SecureStore, and returns to login.
- [ ] A Stop Duty API failure stops local tracking, preserves the secure session, warns that server duty may remain active, and offers Retry and Force Local Logout.
- [ ] Force Local Logout requires confirmation, clearly warns that server duty may remain active, and then clears the secure local session without claiming Stop Duty succeeded.
- [ ] Logout while already off duty removes local tracking/polling and the secure session without calling Stop Duty.
- [ ] Logout after an expired JWT stops local tracking/polling, clears SecureStore, and returns to login without claiming server duty ended.
- [ ] Officer A cannot call duty, location, notes, assignment, arrival, or report routes for Officer B.

## Duty and foreground location

- [ ] Location permission is not requested before Start Duty.
- [ ] Denied permission prevents duty start.
- [ ] Granted permission obtains a position, starts duty, and starts the foreground watcher.
- [ ] Eligible location is sent with accuracy and ISO `recorded_at`, without coordinate logging.
- [ ] Updates occur no faster than the configured 30-second/20-metre watcher limits.
- [ ] Offline update shows retry/network state without ending the duty session.
- [ ] Invalid coordinates return a safe validation message.
- [ ] Off-duty location returns conflict.
- [ ] Duplicate timestamp remains one database location record.
- [ ] Stop Duty and logout remove the watcher and polling timer.
- [ ] Failed Stop Duty says server status may remain active and offers retry; it does not claim success.

## Assignment

- [ ] Polling runs every 10 seconds only while locally on duty.
- [ ] 404 displays no active assignment; offline state offers retry.
- [ ] Assignment shows junction, risk, score, estimate, reasons, time, and response state.
- [ ] App never automatically accepts an assignment.
- [ ] Accept waits for server success and shows EN_ROUTE only afterward.
- [ ] Reject requires a reason and waits for server success.
- [ ] Repeated/already-decided response shows conflict.
- [ ] Navigation opens only after acceptance.
- [ ] Arrival waits for server success; repeated arrival shows conflict.

## Notes and field reports

- [ ] Empty operational note is rejected; valid note succeeds.
- [ ] Invalid optional junction/incident IDs are rejected.
- [ ] Cross-officer note is forbidden.
- [ ] FIELD REPORT label is visible.
- [ ] All five report types are selectable.
- [ ] Severity remains within 0–1 and empty description is rejected.
- [ ] Report cannot submit without a current duty location.
- [ ] Field report creates only `field_reports`; it does not modify risk, historical evidence, or deploy officers.

## Privacy and limitations

- [ ] Profile masks the badge code and explains foreground-only sharing.
- [ ] UI displays privacy-rounded coordinates.
- [ ] Background/always location permission is never requested.
- [ ] No push-notification or Supabase Realtime claim appears.
- [ ] No real officer identity, PIN, secret, JWT, or exact location is present in screenshots/test records.
