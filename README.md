# aiims

## Requirements


```bash
tensorflow==2.18.0
opencv-python
retina-face
pydub
pyannote.audio
## cuda==12.6 update 3 (nvcc --version)
## cudnn==9.6.0
## env -> tf_env(conda)-> python -> 3.9.21
```

## Config

* config.json in /my-app/src/  will allow you to change the ip address required for local network
* config.json in /my-app/ will allow change for the db and the rest if required
* For db schema, you can check the aiims_schema.sql
* change the dementia.sh for path configuration 

