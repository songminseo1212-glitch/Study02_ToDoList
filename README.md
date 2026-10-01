# Study02_ToDoList

브라우저에서 바로 실행되는 개인용 할 일 관리 앱입니다.
하루 10~20개 정도의 할 일을 관리하는 용도이며, 순수 JavaScript(HTML + CSS + JS)만 사용합니다.

## 배포 주소 (GitHub Pages)

- 데스크톱 버전: https://songminseo1212-glitch.github.io/Study02_ToDoList/
- 모바일 버전: https://songminseo1212-glitch.github.io/Study02_ToDoList/mobile_version/

## 기능

- 할 일 추가 / 수정(더블클릭 또는 [수정] 버튼) / 삭제
- 완료 체크 (취소선 표시), 완료 항목 일괄 삭제
- 카테고리 분류 (업무 / 개인 / 공부)와 필터 탭
- 진행률 바 (전체 + 카테고리별)
- `localStorage` 저장으로 새로고침해도 데이터 유지

## 실행 방법

`index.html` 파일을 브라우저로 열면 바로 실행됩니다. 서버나 설치는 필요 없습니다.

## 파일 구성

| 파일 | 설명 |
|---|---|
| `index.html`, `style.css`, `app.js` | 데스크톱 버전 (좌측 사이드바 + 우측 목록 2단 레이아웃, 900px 이하에서는 1단) |
| `mobile_version/` | 모바일 최적화 버전 (단일 컬럼). 같은 `localStorage` 키를 쓰므로 데이터가 공유됩니다 |
| [PRD.md](PRD.md) | 제품 요구사항 문서 |
| [PROMPTS.md](PROMPTS.md) | PRD를 Claude Code용 5단계 프롬프트로 변환한 문서 |

## 진행 상태

- [x] PRD 작성
- [x] M1: 기본 구조 + 추가/삭제 + 저장
- [x] M2: 완료 체크 + 진행률
- [x] M3: 카테고리 + 필터
- [x] M4: 수정 + 일괄 삭제 + 스타일
- [x] M5: 수용 기준 검증 (PRD 9장 전 항목을 로컬 서버에서 브라우저로 확인)

## 데이터 저장

- 저장 위치: 브라우저 `localStorage`의 `todo-app:v1` 키
- 같은 브라우저, 같은 주소(파일 경로)에서만 데이터가 유지됩니다. 브라우저 사이트 데이터를 지우면 할 일도 함께 삭제됩니다.
