# GRAVITY MUSIC STUDIO — Website

## 파일 구조
- `index.html` : 전체 마크업
- `styles.css` : 레이아웃 / 반응형 / 애니메이션
- `script.js` : 로더 / 스크롤 리빌 / 패럴랙스 / 마키 / 모바일 메뉴 / 마이크로인터랙션
- `assets/` : 사진과 영상 넣는 폴더

## 실행
`index.html`을 브라우저에서 열면 됩니다.

VS Code를 사용한다면 Live Server로 열면 가장 편합니다.

## 사진 교체 방법
현재 사진이 필요한 자리는 회색/다크한 플레이스홀더와 이름으로 표시되어 있습니다.

예:
`HERO VIDEO / IMAGE`
`GUITAR IMAGE`
`VOCAL IMAGE`
`ARTIST IMAGE`
`FULL BLEED STUDIO IMAGE`

### 방법 1 — CSS background로 직접 교체
HTML에서 해당 요소에 아래처럼 `data-image`를 추가합니다.

```html
<div class="lesson__media media-placeholder image-reveal"
     data-image="./assets/guitar.jpg"
     data-parallax="0.05">
</div>
```

`script.js`가 자동으로 배경이미지를 적용하고 플레이스홀더 글자를 제거합니다.

### 방법 2 — Hero를 video로 교체
`hero__media` div 내부를 아래와 같이 바꾸면 됩니다.

```html
<video class="hero-video" autoplay muted loop playsinline>
  <source src="./assets/hero.mp4" type="video/mp4">
</video>
```

그리고 CSS에:
```css
.hero-video{
  width:100%;
  height:100%;
  object-fit:cover;
}
```

## 추천 이미지 파일명
- `hero.mp4` 또는 `hero.jpg`
- `about.jpg`
- `guitar.jpg`
- `vocal.jpg`
- `songwriting.jpg`
- `artist.jpg`
- `moment-01.jpg` ~ `moment-06.jpg`
- `kbs.jpg`
- `studio.jpg`
- `album-01.jpg` ~ `album-03.jpg`

## 포함된 인터랙션
- 오프닝 페이지 로더
- HERO 글자 단위 등장
- HERO 스크롤 패럴랙스 / 타이포 이동
- 스크롤 텍스트 reveal
- 이미지 clip-path reveal + scale
- 무한 horizontal marquee
- LESSON 풀스크린 리듬 레이아웃
- MUSIC STARTS HERE horizontal scroll motion
- 섹션별 Header 색 반전용 구조
- 모바일 fullscreen menu
- Magnetic CTA
- Desktop custom cursor
- reduced-motion 접근성 대응

## 디자인 방향
- Black / almost white 기반
- 포인트 컬러는 CTA에만 제한적으로 사용
- PC 좌우 여백 40–64px
- section vertical spacing 120–180px
- Mobile 좌우 22px
- 카드형 UI보다 큰 이미지 + 큰 타이포
- 사진 크기를 100% / 60% / 세로형으로 계속 변화시켜 리듬 생성


## 이번 수정
- 모바일 펼침 메뉴: 완전 블랙 배경 + 화이트 타이포
- 헤더/모바일 메뉴: 제공된 GRAVITY 로고 PNG 적용
- Moments: 모든 이미지 4:3 동일 비율의 정돈된 그리드
- 로고 에셋:
  - `assets/gravity-logo-white.png`
  - `assets/gravity-logo-black.png`
# gravity
