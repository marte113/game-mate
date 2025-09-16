![붕마카세표지](https://github.com/user-attachments/assets/6b1e0124-e36d-48be-be38-c741619c59b4)

<h1 align="middle">붕마카세</h1>
<p align="middle">나만의 붕어빵 아카이브</p>
<p align="center">
<img src="https://img.shields.io/badge/version-0.1.0-orange.svg?cacheSeconds=2592000" />
<a href="https://www.instagram.com/boong_ma" target="_blank"><img src="https://img.shields.io/badge/-instagram-pink?style=square&logo=instagram&logoColor=white" /></a>
  <a href="https://slashpage.com/bungmakase" target="_blank"><img src="https://img.shields.io/badge/-introduction-FBA518?style=square&logo=slashdot&logoColor=white" /></a>
</p>

## 🍞 Project Introduction

<p align="middle">전국 붕어빵 정보를 <b>아카이빙</b>하고, <b>나만의 도감을 완성해가는 재미</b>와<br/>
사용자간 <b>랭킹 경쟁</b>까지 제공하는 붕어빵 특화 플랫폼 
</p>

<a href="https://bungmakase.vercel.app" target="_blank">🍞 붕마카세 서비스 바로가기</a> <br/>
<a href="https://slashpage.com/bungmakase" target="_blank">🍞 붕마카세 소개페이지 바로가기 </a> <br/>

<a href="https://github.com/bungmakase/bungmakase_frontend" target="_blank">🍞 붕마카세 프론트엔드 레포지토리</a> <br/>
<a href="https://github.com/bungmakase/bungmakase_backend" target="_blank">🍞 붕마카세 백엔드 레포지토리</a> <br/>

## 👉 Start

#### 설치

```
pnpm install
```

#### 실행

```
pnpm run dev
```

## 🏃 Developers

|                                                         FE                                                          |                                                         FE                                                          |
| :-----------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: |
| <img style="width: 150px;" src="https://github.com/user-attachments/assets/1089bb2d-5b8c-4295-a35f-5a301b7e393c" /> | <img style="width: 150px;" src="https://github.com/user-attachments/assets/ea136409-cf5f-4053-982b-6296662ecd52" /> |
|                                                       김소현                                                        |                                                       김성진                                                        |
|                                       [@5o-hyun](https://github.com/5o-hyun)                                        |                                       [@muffin9](https://github.com/muffin9)                                        |

## 👨‍💻 Tech Stacks

  <a href="https://skillicons.dev">
    <img src="https://go-skill-icons.vercel.app/api/icons?i=nextjs,ts,reactquery,tailwind,shadcn,storybook,zustand,pnpm&titles=true"/>
  </a>

Node v.22.13.0 (LTS)  
언어/프레임워크 : `typescript` `nextjs@15`  
UI 라이브러리/프레임워크 : `tailwind` `shadcn/ui` `framer-motion`  
상태 관리 라이브러리: `zustand` `tanstack@react-query`  
테스트도구 : `storybook` `vitest`  
데이터검증 : `zod`  
패키지매니저 : `pnpm`  
지도: `kakao maps api`

## 📚 Architecture

root/  
├── app/ # Next.js 라우팅 처리 (app directory 구조)  
├── api/ # react-query로 데이터 패칭 관련 파일  
├── styles/ # 스타일 관련 파일 (글로벌 스타일, CSS 변수)  
├── components/ # 공통 컴포넌트 모음  
│ ├── common/ # Footer, Header 등 여러 페이지에서 공통으로 사용하는 컴포넌트  
│ ├── ui/ # shadcn/ui 명령어로 생성된 UI 컴포넌트  
├── hooks/ # 재사용 가능한 React 커스텀 훅  
├── interfaces/ # TypeScript 인터페이스 및 타입 정의 파일  
├── types/ # interfaces와 비슷하지만, 전역적으로 사용하는 유틸리티 타입, 단순 타입 정의 관리.  
├── lib/ # 데이터 포멧 관련, 유틸리티 함수, API 통신 모듈  
├── mocks/ # Mock 데이터 및 관련 설정 파일 (e.g., MSW, JSON mock)  
├── store/ # 상태 관리와 관련된 모든 파일을 저장.  
├── constants/ # 프로젝트 전역에서 사용하는 상수 값  
├── config/ # 프로젝트 설정 관련 파일 (e.g., 환경 변수, 라우팅 설정, DB)

`도메인별로 관심사를 분리`, 유저 마이페이지 관련 도메인이라고 가정했을 때 app-mypage / components-mypage 폴더를 각각 생성하여 코드 작성

vitest 코드는 해보고 싶은 페이지나, 필요한 로직에 자율적으로 작성  
storybook 코드는 ui test를 할 코드와 동일한 위치에 작성

## 📌 Functional Specification

<img width="991" alt="Image" src="https://github.com/user-attachments/assets/8b3bf594-659a-46ae-b0d6-31144bc5c2a5" />

## 🗳️ API Specification

[API DOCS](http://211.188.61.117:8080/swagger-ui/index.html)

## 💡 Intro

![1](https://github.com/user-attachments/assets/5e169517-9a94-46c2-8ff3-726cff51b7f9)
![2](https://github.com/user-attachments/assets/33004387-5e0c-48f0-b204-1dabbc0ea9ef)
![3](https://github.com/user-attachments/assets/d0b925d1-b68e-46f8-95dc-f7bb7ce81b2e)

## 💡 Functions

![4](https://github.com/user-attachments/assets/463c58de-b756-4e3e-814c-2394c09b8531)
![5](https://github.com/user-attachments/assets/be8a99a0-7d66-4a6b-ac9b-a4f95452543a)
![6](https://github.com/user-attachments/assets/0fa3b7c1-7f55-4625-a268-f61de669aafc)

## 💫 License

Copyright © 2025 bungmakase-frontend
