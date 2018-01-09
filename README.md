# GULP site generator
- PUG-JSON
- Bootstrap v4.0.0-beta.2 - SASS-autoPrefixer-unCSS-CriticalPath
- JS-Babel-Bundle

## RUN
- gulp img - for images
- gulp bundle - for JS
- gulp - for normal build
- gulp uncss - for compact css

## AMP


1. Set "- inline = false" in views/templates/layout_AMP.pug 
1. Run gulp
1. Run gulp uncss
1. Set "- inline = true" in views/templates/layout_AMP.pug 
1. Run gulp amp
1. copy the template to server
