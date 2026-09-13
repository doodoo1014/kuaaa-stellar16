# Stellar 16 — KUAAA

고려대학교 아마추어 천문회 KUAAA 행사에서 사용하는 모바일 우선 별 성향검사입니다.

**Korea University Amateur Astronomical Association**

## 현재 구성

- 12문항 / 16개 결과 유형
- 브라우저 내부 채점: 응답은 서버로 전송하지 않음
- 결과 장문 설명, 잘 맞는 별 / 어색한 별
- 결과 PNG 저장
- 전체 16유형 탐색
- 실시간 Canvas 별빛·유성 배경
- Stellarium Western 별자리 연결선을 사용한 결과 시각화
- 결과 별은 동일한 4각 sparkle 형태이며 유형별 실제 별 색감만 다르게 표시
- PWA/Service Worker 오프라인 캐시

## 완전 로컬 런타임 데이터

사이트 실행 중 외부 천문 데이터 CDN에 접근하지 않습니다.

- `data/western-stellar16.json`: Stellar 16에 필요한 Stellarium Western 별자리 선만 추출
- `data/stars-stellar16.csv`: 해당 선과 16개 결과 별에 필요한 좌표/등급만 추출

두 파일은 `.github/workflows/deploy-pages.yml`이 `scripts/vendor_sky_data.py`를 실행해 생성하고 저장소에 커밋합니다. 데이터 출처와 라이선스는 [THIRD_PARTY_DATA.md](./THIRD_PARTY_DATA.md)를 참고하세요.

외부 링크는 KUAAA 공식 Instagram 등 사용자가 직접 이동하는 링크뿐이며, 사이트 렌더링에 필요한 외부 이미지·폰트·JavaScript 라이브러리는 없습니다.

## GitHub Pages

`main` 브랜치에 push하면 GitHub Actions가 다음을 수행합니다.

1. Stellarium/HYG 원본에서 필요한 최소 데이터만 추출
2. 생성된 데이터 파일을 저장소에 커밋
3. GitHub Pages를 workflow 방식으로 준비
4. 정적 사이트를 Pages에 배포

예상 주소:

`https://doodoo1014.github.io/kuaaa-stellar16/`

## 로컬 실행

데이터 파일이 이미 생성된 저장소를 받은 뒤:

```bash
python -m http.server 8080
```

브라우저에서 `http://localhost:8080`에 접속합니다.
