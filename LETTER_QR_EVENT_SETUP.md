# 편지 찾기 QR 이벤트 설정 가이드

이 기능은 현장에 숨긴 편지 3통의 QR을 스캔하면 참가자별로 찾은 편지 수를 기록하고 보여주는 이벤트입니다.

## 1. Supabase SQL 실행

Supabase Dashboard > SQL Editor에서 아래 파일 내용을 실행합니다.

```text
supabase/letter.sql
```

생성되는 주요 항목:

- `yayeon_letter_slots`: 편지 A/B/C와 QR 토큰 저장
- `yayeon_letter_sessions`: 참가자 브라우저 세션 저장
- `yayeon_letter_scans`: 참가자별 편지 스캔 기록 저장
- `scan_yayeon_letter()`: QR 스캔 처리 RPC
- `get_yayeon_letter_progress()`: 현재 진행상황 조회 RPC

## 2. QR URL

현재 SQL에 들어간 QR 토큰은 아래 3개입니다.

```text
A: /s/8cc76309cbde4c41993a9c47e26e018a
B: /s/941c6a14230bb8f20327db269cbc2a24
C: /s/93c55051a68cf14fad266419ec7ed208
```

운영 URL 예시:

```text
https://YOUR-DOMAIN/s/8cc76309cbde4c41993a9c47e26e018a
https://YOUR-DOMAIN/s/941c6a14230bb8f20327db269cbc2a24
https://YOUR-DOMAIN/s/93c55051a68cf14fad266419ec7ed208
```

## 3. Netlify 환경변수

행운권 이벤트에서 이미 등록한 아래 값이 그대로 필요합니다.

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

새 환경변수는 필수로 추가하지 않아도 됩니다.

## 4. 동작 방식

1. 참가자가 QR을 스캔합니다.
2. `/s/{token}` 주소가 `netlify/functions/letter-scan.js`로 연결됩니다.
3. 브라우저에 `yayeon_letter_sid` 쿠키가 없으면 새 세션을 만듭니다.
4. QR 토큰에 해당하는 편지 슬롯 A/B/C를 찾습니다.
5. `session_id + slot_id` 조합으로 저장합니다.
6. 같은 QR을 다시 찍어도 unique 제약 때문에 개수가 증가하지 않습니다.
7. 결과 화면에 `편지 N통을 찾았습니다`를 보여줍니다.

## 5. 테스트 체크리스트

- A QR 스캔 후 `1/3` 표시
- 같은 A QR 재스캔 후 여전히 `1/3`
- B QR 스캔 후 `2/3`
- C QR 스캔 후 `3/3`
- `/letter-progress` 접속 시 현재 진행 상황 표시
- 시크릿 창에서는 새 참가자로 시작되는지 확인
- 무효 토큰 접속 시 오류 안내 표시

## 6. 운영 메모

쿠키 기반이므로 같은 참가자가 다른 브라우저, 다른 기기, 시크릿 창을 쓰면 새 참가자로 인식됩니다. 현장 이벤트에서는 이 정도가 가장 빠르고 부담 없는 방식이며, 완전한 본인 인증이 필요하면 예약번호나 현장 코드를 추가해야 합니다.
