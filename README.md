# TOC Action Renderer

This bundle adds another action to the TOC which allows to customize the renderer of a layer.

# Build Status
[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-toc-action-renderer/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-toc-action-renderer/actions/workflows/devnet-bundle-snapshot.yml)

## Sample App
https://demos.conterra.de/mapapps/resources/apps/public_demo_tocactionrenderer/index.html

## Installation Guide
**Requirement: map.apps 4.7.0**

[dn_tocactionrenderer Documentation](https://github.com/conterra/mapapps-toc-action-renderer/tree/master/src/main/js/bundles/dn_tocactionrenderer)

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
