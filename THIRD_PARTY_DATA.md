# Third-party astronomy data

Stellar 16 vendors only the small subset of astronomy data needed by its 16 result types.

## Stellarium Western sky culture

- Source: `Stellarium/stellarium-skycultures`, `western/index.json`
- Project: https://github.com/Stellarium/stellarium-skycultures
- Used data: constellation line topology for `UMi`, `Car`, `Cru`, `CMa`, `PsA`, `Vir`, `Lyr`, `Aur`, `Boo`, `Ori`, `Sco`, `Ari`, `Cyg`, `Per`, and `And`
- Upstream license for Western text and data: **CC BY-SA**
- Upstream attribution: Stellarium team

The generated `data/western-stellar16.json` is a reduced derivative containing only the line data required by this site.

## HYG Database v4.1 star coordinates

- Upstream: HYG Database v4.1 by Astronexus
- Source used for this project: the reduced `stars.csv` published by `devtx-labs-kr/aidlc-workshop-stargazer`
- Upstream HYG license: **CC BY-SA**
- Used columns in the generated subset: Hipparcos ID, right ascension, declination, apparent magnitude, spectral class, constellation, proper name, distance, Bayer designation

The generated `data/stars-stellar16.csv` contains only stars referenced by the selected Stellarium line definitions plus the 16 highlighted result stars.

## Share-alike notice

The vendored astronomy data files are redistributed under the applicable CC BY-SA terms of their sources. The Stellar 16 application code and original Korean personality-test copy are separate project material.
