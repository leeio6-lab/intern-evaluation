// ==========================================
// Google Apps Script - 인턴 평가 서버
// ==========================================
// 이 코드를 Google Apps Script에 붙여넣으세요.
// 설정 방법은 아래 주석을 참고하세요.
//
// [설정 방법]
// 1. Google 스프레드시트를 새로 생성합니다
// 2. 메뉴에서 [확장 프로그램] → [Apps Script] 클릭
// 3. 기존 코드를 모두 지우고 이 파일의 내용을 붙여넣기
// 4. [배포] → [새 배포] 클릭
// 5. 유형: "웹 앱" 선택
// 6. "다음 사용자 인증으로 실행": "나" 선택
// 7. "액세스 권한이 있는 사용자": "모든 사용자" 선택
// 8. [배포] 클릭 → 생성된 URL을 복사
// 9. 평가 시스템 대시보드의 "서버 연동 설정"에 URL 붙여넣기
// ==========================================

const SHEET_NAME = '평가데이터';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    // 첫 행에 헤더가 없으면 생성
    if (sheet.getLastRow() === 0) {
      const headers = [
        'id', 'submitted_at', 'evaluator_name', 'intern_name',
        'presentation_topic', 'presentation_date',
        'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7',
        'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14',
        'weighted_score', 'overall_score',
        'competency_level', 'recommendation',
        'impressive_point', 'improvement', 'message'
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(h => data[h] !== undefined ? data[h] : '');
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();

    if (sheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}
