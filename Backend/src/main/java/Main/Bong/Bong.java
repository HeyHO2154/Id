package Main.Bong;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Bong {

    @Id
    private String progrmRegistNo; // 프로그램 등록번호 (Primary Key)

    private String progrmSj; // 봉사 제목
    private int progrmSttusSe; // 모집 상태
    private Date progrmBgnde; // 봉사 시작일자
    private Date progrmEndde; // 봉사 종료일자
    private int actBeginTm; // 봉사 시작 시간
    private int actEndTm; // 봉사 종료 시간
    private Date noticeBgnde; // 모집 시작일자
    private Date noticeEndde; // 모집 종료일자
    private int rcritNmpr; // 모집 인원
    private String actWkdy; // 활동 요일
    private String srvcClCode; // 봉사 분야
    private String adultPosblAt; // 성인 가능 여부
    private String yngbgsPosblAt; // 청소년 가능 여부
    private String grpPosblAt; // 단체 가능 여부
    private String mnnstNm; // 모집 기관명
    private String nanmmbyNm; // 등록 기관명
    private String actPlace; // 봉사 장소
    private String nanmmbyNmAdmn; // 담당자명
    private String telno; // 전화번호
    private String fxnum; // FAX 번호
    private String postAdres; // 담당자 주소
    private String email; // 이메일
    @Column(columnDefinition = "TEXT")
    private String progrmCn; // 내용
    private String sidoCd; // 시도 코드
    private String gugunCd; // 시군구 코드

    // Getters and Setters
    public String getProgrmRegistNo() {
        return progrmRegistNo;
    }

    public void setProgrmRegistNo(String progrmRegistNo) {
        this.progrmRegistNo = progrmRegistNo;
    }

    public String getProgrmSj() {
        return progrmSj;
    }

    public void setProgrmSj(String progrmSj) {
        this.progrmSj = progrmSj;
    }

    public int getProgrmSttusSe() {
        return progrmSttusSe;
    }

    public void setProgrmSttusSe(int progrmSttusSe) {
        this.progrmSttusSe = progrmSttusSe;
    }

    public Date getProgrmBgnde() {
        return progrmBgnde;
    }

    public void setProgrmBgnde(Date progrmBgnde) {
        this.progrmBgnde = progrmBgnde;
    }

    public Date getProgrmEndde() {
        return progrmEndde;
    }

    public void setProgrmEndde(Date progrmEndde) {
        this.progrmEndde = progrmEndde;
    }

    public int getActBeginTm() {
        return actBeginTm;
    }

    public void setActBeginTm(int actBeginTm) {
        this.actBeginTm = actBeginTm;
    }

    public int getActEndTm() {
        return actEndTm;
    }

    public void setActEndTm(int actEndTm) {
        this.actEndTm = actEndTm;
    }

    public Date getNoticeBgnde() {
        return noticeBgnde;
    }

    public void setNoticeBgnde(Date noticeBgnde) {
        this.noticeBgnde = noticeBgnde;
    }

    public Date getNoticeEndde() {
        return noticeEndde;
    }

    public void setNoticeEndde(Date noticeEndde) {
        this.noticeEndde = noticeEndde;
    }

    public int getRcritNmpr() {
        return rcritNmpr;
    }

    public void setRcritNmpr(int rcritNmpr) {
        this.rcritNmpr = rcritNmpr;
    }

    public String getActWkdy() {
        return actWkdy;
    }

    public void setActWkdy(String actWkdy) {
        this.actWkdy = actWkdy;
    }

    public String getSrvcClCode() {
        return srvcClCode;
    }

    public void setSrvcClCode(String srvcClCode) {
        this.srvcClCode = srvcClCode;
    }

    public String getAdultPosblAt() {
        return adultPosblAt;
    }

    public void setAdultPosblAt(String adultPosblAt) {
        this.adultPosblAt = adultPosblAt;
    }

    public String getYngbgsPosblAt() {
        return yngbgsPosblAt;
    }

    public void setYngbgsPosblAt(String yngbgsPosblAt) {
        this.yngbgsPosblAt = yngbgsPosblAt;
    }

    public String getGrpPosblAt() {
        return grpPosblAt;
    }

    public void setGrpPosblAt(String grpPosblAt) {
        this.grpPosblAt = grpPosblAt;
    }

    public String getMnnstNm() {
        return mnnstNm;
    }

    public void setMnnstNm(String mnnstNm) {
        this.mnnstNm = mnnstNm;
    }

    public String getNanmmbyNm() {
        return nanmmbyNm;
    }

    public void setNanmmbyNm(String nanmmbyNm) {
        this.nanmmbyNm = nanmmbyNm;
    }

    public String getActPlace() {
        return actPlace;
    }

    public void setActPlace(String actPlace) {
        this.actPlace = actPlace;
    }

    public String getNanmmbyNmAdmn() {
        return nanmmbyNmAdmn;
    }

    public void setNanmmbyNmAdmn(String nanmmbyNmAdmn) {
        this.nanmmbyNmAdmn = nanmmbyNmAdmn;
    }

    public String getTelno() {
        return telno;
    }

    public void setTelno(String telno) {
        this.telno = telno;
    }

    public String getFxnum() {
        return fxnum;
    }

    public void setFxnum(String fxnum) {
        this.fxnum = fxnum;
    }

    public String getPostAdres() {
        return postAdres;
    }

    public void setPostAdres(String postAdres) {
        this.postAdres = postAdres;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProgrmCn() {
        return progrmCn;
    }

    public void setProgrmCn(String progrmCn) {
        this.progrmCn = progrmCn;
    }

    public String getSidoCd() {
        return sidoCd;
    }

    public void setSidoCd(String sidoCd) {
        this.sidoCd = sidoCd;
    }

    public String getGugunCd() {
        return gugunCd;
    }

    public void setGugunCd(String gugunCd) {
        this.gugunCd = gugunCd;
    }
}
