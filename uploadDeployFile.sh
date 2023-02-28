curl -i -X POST -H "Content-Type: multipart/form-data" -F "file=@PMS_0.0.1.zip" -F "kind=PMSUat" http://10.115.40.155:8098/

curl -i -X POST -H "Content-Type: multipart/form-data" -F "file=@PMS_0.0.1.zip" -F "kind=PMSDev" http://10.115.40.155:8098/
# curl -i -X POST -H "Content-Type: multipart/form-data" -F "file=@PMS_0.0.1.zip" -F "kind=PMSSTAGING" http://10.115.40.155:8098/
