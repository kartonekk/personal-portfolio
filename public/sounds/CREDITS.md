# Sound credits

Minecraft's own sound files, taken from the local game install's asset store
(`%APPDATA%/.minecraft/assets`), asset index `32`.

| File | Minecraft asset path | sha1 |
| --- | --- | --- |
| `fall.ogg` | `minecraft/sounds/damage/fallbig.ogg` | `6582e589d649de71649f01db4f24eb8d90ea0a74` |
| `hurt.ogg` | `minecraft/sounds/damage/hit1.ogg` | `c43077ac1f9ceda7e9e1c152f839baf207833aa8` |
| `step.ogg` | `minecraft/sounds/step/stone1.ogg` | `ef859078b24917d4a9d12e84c2a63d08bef04d97` |

Both `fall.ogg` and `hurt.ogg` fire together on landing: `causeFallDamage` plays
the fall sound, and the damage it deals separately triggers the player hurt
sound.

These are Mojang's assets, used here as fan content. They are not CC0 and not
redistributable as standalone downloads.
