# dn_tocactionrenderer

This bundle adds another action to the TOC which allows to customize the renderer of a layer.

## Usage

1. Install the vue-color bundle: https://github.com/conterra/mapapps-vue-color
2. Add the dn_tocactionrenderer bundle to your app.
3. Add the action _change-renderer-action_ to the toc actions

```json
"toc": {
    "Config": {
        "actions": [
            "show-description",
            "zoom-to-extent",
            "activate-children",
            "deactivate-children",
            "change-opacity",
            "show-copyright",
            "change-renderer-action"
        ]
    }
}
```

There are no further configurations necessary or possible via the app.json.

Open the widget via the TOC. The action is called "Change Renderer" and is available for all FeatureLayers.
