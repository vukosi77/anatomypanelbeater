#!/bin/sh
# Run from the site root (the folder that contains images/). Gives images descriptive, SEO-friendly names.
cd images || exit 1
mv -n "log.jpeg" "anatomy-panel-beaters-logo.jpeg"
mv -n "rt.webp" "panel-beating-workshop-bay.webp"
mv -n "ldp7zw.mp4" "workshop-in-action.mp4"
mv -n "before.jpg" "rear-quarter-panel-before-repair.jpg"
mv -n "after.jpg" "rear-quarter-panel-after-repair.jpg"
mv -n "bonnet.jpg" "bonnet-hail-damage-before.jpg"
mv -n "car-bonnet-repair.jpg" "bonnet-hail-damage-after-pdr.jpg"
mv -n "before respray.jpg" "sedan-respray-before.jpg"
mv -n "after respray.jpg" "sedan-respray-after.jpg"
mv -n "before front-end.jpeg" "chassis-straightening-before.jpeg"
mv -n "after front-end.jpeg" "chassis-straightening-after.jpeg"
mv -n "before 11.jpg" "classic-fender-restoration-before.jpg"
mv -n "after 11.jpg" "classic-fender-restoration-after.jpg"
mv -n "before side panel repair.jpg" "van-side-panel-repair-before.jpg"
mv -n "after side panel repair.jpg" "van-side-panel-repair-after.jpg"
echo "Images renamed."
