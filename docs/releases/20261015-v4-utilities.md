# V4 utilities and equipment visibility

- Gas: share IH/gas-hot-water and gas-cooker standards, with a consistent start/contact/phone/web/stop layout for 10100, 11300, 20400, 40100 and 27500. Keep LP instructions separate.
- Osaka Gas start/stop phone numbers follow the property municipality. Address lookup does not confirm a supplier or an emergency network operator.
- Water: refresh 10100 Osaka City guidance; add Osaka City and Nishinomiya phone actions to 10100 and 10400.
- Electricity: add conditional Kansai Electric contact details for 10100, 20400, 40100, 27500 and 10400. Preserve 11300 management-metered billing and 10400 electric-water-heater/night-power guidance.
- Equipment: hide absent delivery boxes; source mailbox=no_post hides mailbox guidance even when a V4 content override exists.

## Validation

Local browser checks at 320px and 375px and production browser checks passed for the six properties. Checked utility phone/web actions, gas emergency separation, equipment guidance, navigation and horizontal overflow. Final no_post deployment changed only v4/property-settings.js; other 61 Hosting files and hosting configuration were preserved.

Hosting site: univlife-living-guide. Latest version: b24c95b9719dbbc4. Existing URL structure is unchanged. Content changes are stored in Google Sheets/Firestore; the adjacent JSON is a public-content snapshot for review, not an automatic import.

Public: https://guide.univ-life.com/v4/?propertyNo=10100#intro
Sheet: https://docs.google.com/spreadsheets/d/11KJOQlt-eyz1O1AB3OtCEmzN0DfahUutw4oe1ouRZsA/edit
