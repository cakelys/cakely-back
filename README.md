# 🎂 Cakely Backend

Cakely 서비스의 백엔드 API입니다.

## ✨ 주요 기능

- **🍰 케이크 정보 관리**: 케이크 데이터 생성, 조회, 수정, 삭제 (CRUD)
- **🏪 상점 정보 관리**: 상점 데이터 생성, 조회, 수정, 삭제 (CRUD)
- **🙋‍♀️ 사용자 관리 및 인증**: Firebase를 이용한 사용자 인증 및 정보 관리
- **❤️ 좋아요 기능**: 사용자가 케이크와 상점에 '좋아요'를 표시하는 기능
- **🔍 검색**: 케이크 및 상점 검색 기능
- **📸 이미지 업로드**: AWS S3를 이용한 이미지 파일 업로드 및 관리
- **🗺️ 위치 기반 서비스**: Kakao Maps API를 활용한 주소 및 위치 관련 기능

## 🛠️ 기술 스택

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **File Storage**: [AWS S3](https://aws.amazon.com/s3/)
- **API Clients**: [Kakao Map API](https://apis.map.kakao.com/)
- **Deployment**: [Serverless Framework](https://www.serverless.com/) on AWS Lambda
- **Linting/Formatting**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

## 🏛️ 아키텍처 (Architecture)

Cakely 백엔드는 서버리스 아키텍처를 기반으로 설계되었습니다. 모든 API는 AWS Lambda를 통해 실행되며, API Gateway를 통해 외부로 노출됩니다. 인증은 Firebase Authentication을 사용합니다.

1.  S3에 케이크 이미지를 업로드합니다.
2.  S3에 이미지가 업로드되면, S3 Event Notification이 Lambda 함수를 트리거합니다.
3.  트리거된 Lambda 함수는 이미지 사이즈를 조정(resizing)하고, 최적화하여 다른 S3 버킷에 저장합니다.
4.  동시에 이미지의 벡터값을 추출하여 Vector DB에 저장함으로써 이미지 검색에 활용합니다.

<img width="4336" height="1540" alt="Image" src="https://github.com/user-attachments/assets/75cc6a82-081e-43af-8e81-97f321ac1ecd" />

## 🚀 시작하기

### 1. 저장소 복제

```bash
# git clone https://github.com/your-repository/cakely-back.git
# cd cakely-back
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.dev` 파일을 생성하고 아래와 같이 필요한 환경 변수를 설정합니다.

```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region

# Kakao
KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

### 4. 애플리케이션 실행

```bash
# 개발 모드 (watch)
npm run start:dev
```

애플리케이션은 `http://localhost:3000`에서 실행됩니다.

## 📁 프로젝트 구조

```
src
├───auth          # 인증 (Firebase)
├───cakes         # 케이크 API
├───clients       # 외부 API 클라이언트 (Kakao Map)
├───common        # 공통 모듈 (DTO, Entity 등)
├───likes         # 좋아요 API
├───s3            # AWS S3 파일 관리
├───search        # 검색 API
├───stores        # 상점 API
├───users         # 사용자 API
└───utils         # 유틸리티 함수
```
