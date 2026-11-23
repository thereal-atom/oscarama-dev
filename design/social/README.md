# Oscar Shoots — social banners

Burst-in-pixels logo. Rendered from `/photos/banners/<id>` (src/pages/photos/banners/[id].astro) on the experiment branch.

Banners come in four layouts, suffixed -a to -d (see the Socials section on /photos/logos/orange-dark, which has download buttons):
a: as before (tagline, divider, clients with names) · b: no divider, one-line tagline · c: like b with client marks only · d: two tiers, wordmark then tagline + marks.

| File | Size | Use |
|---|---|---|
| oscar-shoots-x-{a,b,c,d}.png | 1500×500 | X header |
| oscar-shoots-linkedin-{a,b,c,d}.png | 1584×396 | LinkedIn profile banner |
| oscar-shoots-linkedin-page-{a,b,c,d}.png | 1128×191 | LinkedIn company page cover |
| oscar-shoots-youtube-{a,b,c,d}.png | 2560×1440 | YouTube channel banner (text sits in the 1546×423 safe area) |
| oscar-shoots-avatar-dark.png | 800×800 | Profile photo: Instagram, X, LinkedIn, TikTok, YouTube |
| oscar-shoots-avatar-orange.png | 800×800 | Same, orange version |

To re-export after a change, with the dev server on :4392:

    H=/Applications/Helium.app/Contents/MacOS/Helium
    "$H" --headless=new --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=4000 \
      --window-size=1500,500 --screenshot=$PWD/design/social/oscar-shoots-x-b.png http://localhost:4392/photos/banners/x-b
