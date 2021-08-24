# Jobfair support Setup project

## Viblo Docker for PHP Development
- Clone repo from: [docker-php-development](https://github.com/sun-asterisk-research/docker-php-development)
- Reset commit `f5da6bf feat: update default minio region`
```
cd docker-php-development
git reset --hard f5da6bf
```

- Using in Jobfair support
```
Folder project
+ |- docker-php-development
+ |- jobfair-support
```

In your terminal window, open the hosts file using your favorite text editor:

```sudo nano /etc/hosts```

```127.0.0.1 jobfair.local traefik.jobfair.local phpmyadmin.jobfair.local```

## Services
In folder docker-php-development
Create file `services`
```plain
mysql
redis
php
web
phpmyadmin
```

## Env
- Run project with .env in docker-php-development
```
#-------------------------------------------------------------------------------
# Code paths
#-------------------------------------------------------------------------------

PATH_PHP=../jobfair-support/api
PATH_WEB=../jobfair-support/web

#-------------------------------------------------------------------------------
# Data paths
#-------------------------------------------------------------------------------

PATH_DATA=./data
PATH_LOGS=./logs

#-------------------------------------------------------------------------------
# Traefik domain and ports
# DOMAIN, PORT defines public domain for your PHP application
# DOMAIN_WEB defines public domain for your Node.js application
# DOMAIN_SECONDARY is the domain used for other services e.g traefik, mailhog, phpmyadmin .etc
#-------------------------------------------------------------------------------

DOMAIN=jobfair.local
DOMAIN_WEB=jobfair.local
PORT=8000

DOMAIN_SECONDARY=jobfair.local

#-------------------------------------------------------------------------------
# Databases
# DB_DATABASE, DB_USERNAME and DB_PASSWORD are mandatory
# You can leave the others empty for default values
#-------------------------------------------------------------------------------

DB_DATABASE=jobfair
DB_USERNAME=jobfair
DB_PASSWORD=secret

#-------------------------------------------------------------------------------
# Other things
#-------------------------------------------------------------------------------

ELASTICSEARCH_VERSION=7.3.2

MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=miniostorage
MINIO_REGION_NAME=us-east-1

PGADMIN_DEFAULT_EMAIL=admin@domain.com
PGADMIN_DEFAULT_PASSWORD=secret

MEMORY_LIMIT_PHP_FPM=1G
MEMORY_LIMIT_BEANSTALKD=200m
MEMORY_LIMIT_ELASTICSEARCH=512m
MEMORY_LIMIT_MAILHOG=200m
MEMORY_LIMIT_MYSQL=1G
MEMORY_LIMIT_POSTGRES=1G
MEMORY_LIMIT_REDIS=200m

NGINX_DOCUMENT_ROOT=/php/public
NGINX_CONFIG_TEMPLATE=./config/nginx/default.conf

# LARAVEL_ECHO_SERVER_REDIS_KEY_PREFIX=

COMPOSE_PROJECT_NAME=jobfair
HOSTS_FILE=/etc/hosts
```

## Run container
```
cd docker-php-development
./project up
```

- API:
```
cd docker-php-development
./project sh php
/php # composer install
/php # php artisan key:generate
/php # php artisan migrate
/php # chmod -R 777 storage/
```

- Web:
```
cd docker-php-development
./project sh web
/web # yarn
/web # yarn dev
```

## Folder api: jobfair-support/api
copy .env.example to .env
```
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:Od/M6XLZCbBcsAn5wjPWRr8YKUdpijE7OD5zgykn96A=
APP_DEBUG=true
APP_URL=http://jobfair.local:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=jobfair
DB_USERNAME=root
DB_PASSWORD=root

BROADCAST_DRIVER=redis
CACHE_DRIVER=file
FILESYSTEM_DRIVER=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=null
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

```

## Folder web: jobfair-support/web
Copy .env.example to .env
```
#-------------------------------------------------------------------------------
# Application info
#-------------------------------------------------------------------------------

APP_ENV=local
APP_KEY=base64:Od/M6XLZCbBcsAn5wjPWRr8YKUdpijE7OD5zgykn96A=

#-------------------------------------------------------------------------------
# URLs: app url, image url...
#-------------------------------------------------------------------------------

APP_URL=http://jobfair.local:8000
IMAGE_URL=http://images-jobfair.local:8000

SERVER_API_URL=http://nginx/api
BROWSER_API_URL=/api

REDIS_HOST=redis

#-------------------------------------------------------------------------------
# Sentry
#-------------------------------------------------------------------------------

SENTRY_DSN=
MIX_GA_ID=
```

## Github workflow

- Khi bắt đầu dự án cần fork repo **framgia/jobfair-support** về
- Tiếp đó tiên hành clone code từ repo đã fork nói trên **[username]/jobfair-support**
- Sau khi clone sẽ di chuyển vào folder vừa clone để add thêm repo chính của dự án **framgia/jobfair-support** với lệnh sau nếu sử dụng SSH key:
```
git remote add sun git@github.com:framgia/jobfair-support.git
```
hoặc nếu sử dụng https
```
git remote add sun https://github.com/framgia/jobfair-support.git
```
- Branch chính của dự án là **develop**
- Mỗi tính năng mới hoặc bug fix mới sẽ làm theo flow như sau
1. Đảm bảo code mới nhất ở nhánh develop dưới local tương đương với nhánh mới nhất trên server bằng cách chạy 2 lệnh:
```
git checkout develop
git pull sun develop
```

2. Checkout một nhánh mới cho tính nắng cần làm

```
git checkout -b feat/login
```

3. Sau khi code xong tiến thành commit code
```
git add .
git commit -m"feat: login"
```

4. Giả sử sau khi code xong tính năng login trong nhánh *feat/login* nói trên và gửi chuẩn bị gửi pull request mà thấy branch develop trên server có code mới của các bạn khác thì cần chạy lệnh như sau trước khi tạo pull request:
```
git checkout develop
git pull sun develop
git checkout feat/login
git rebase develop
```
*Sau khi rebase phát hiện có conflict thì chủ động xử lý

*Trường hợp nếu nhánh develop trên repo chính không có code mới thì có thể bỏ qua bước 4

5. Push nhánh **feat/login** vừa làm lên repo fork về:
```
git push origin feat/login
```

6. Tạo pull request từ branch nói trên trong repo fork về đến branch develop trong repo chính

=> Quá trình nói trên được lặp lại trong toàn bộ chu trình phát triển của dự 
