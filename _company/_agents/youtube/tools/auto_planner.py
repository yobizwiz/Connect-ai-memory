#!/usr/bin/env python3
"""Auto Planner — runs trend_sniper.py on a fixed interval for a chosen
duration (e.g. overnight). Reads its config from auto_planner.json."""
import os, json, time, datetime, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(HERE, "auto_planner.json")
SNIPER_PATH = os.path.join(HERE, "trend_sniper.py")
PID_PATH = os.path.join(HERE, "auto_planner.pid")

def load_config():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ 설정 파일을 읽을 수 없어요: {CONFIG_PATH}\n{e}")
        sys.exit(1)

def terminate_existing_daemon():
    if not os.path.exists(PID_PATH):
        return
    try:
        with open(PID_PATH, "r", encoding="utf-8") as f:
            pid = int(f.read().strip())
    except (ValueError, OSError):
        return

    print(f"🔄 기존 백그라운드 데몬 (PID: {pid}) 종료 시도 중...", flush=True)
    if os.name == 'nt':
        try:
            # /F forces termination, /T terminates specified process and child processes
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(pid)], capture_output=True, check=False)
        except Exception as e:
            print(f"⚠️ taskkill 실행 실패: {e}", flush=True)
    else:
        try:
            os.kill(pid, 9)
        except OSError:
            pass
    
    try:
        if os.path.exists(PID_PATH):
            os.remove(PID_PATH)
    except OSError:
        pass

def main():
    cfg = load_config()
    interval_h = float(cfg.get("INTERVAL_HOURS", 6))
    total_h = float(cfg.get("TOTAL_RUN_HOURS", 0))

    is_daemon = "--daemon" in sys.argv

    if is_daemon:
        # Write PID to PID_PATH
        try:
            with open(PID_PATH, "w", encoding="utf-8") as f:
                f.write(str(os.getpid()))
        except Exception as e:
            print(f"⚠️ PID 파일 생성 실패: {e}", file=sys.stderr)

        # [데몬 모드] 백그라운드에서 조용히 대기하며 주기적으로 스캔
        log_path = os.path.join(HERE, "planner.log")
        try:
            log_file = open(log_path, "a", encoding="utf-8")
            sys.stdout = log_file
            sys.stderr = log_file
        except Exception:
            pass

        try:
            start = time.time()
            loop = 1  # 1회차는 부모 프로세스가 이미 실행 완료함
            while True:
                # 설정 가동 시간 초과 시 종료
                if total_h > 0 and (time.time() - start > total_h * 3600):
                    print("\n☀️ 목표 가동 시간을 채웠어요. 종료합니다.")
                    break

                # 다음 실행 시간까지 대기
                next_at = datetime.datetime.now() + datetime.timedelta(hours=interval_h)
                print(f"⏳ 다음 실행 대기 중: {next_at.strftime('%Y-%m-%d %H:%M')} ({interval_h}시간 후)", flush=True)
                time.sleep(interval_h * 3600)

                loop += 1
                ts = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                elapsed_h = (time.time() - start) / 3600
                print(f"\n[{ts}] 🤖 {loop}회차 트렌드 스나이핑 (가동 {elapsed_h:.1f}시간)", flush=True)
                try:
                    subprocess.run([sys.executable, SNIPER_PATH], check=False)
                except Exception as e:
                    print(f"❌ 실행 실패: {e}", flush=True)
        finally:
            try:
                if os.path.exists(PID_PATH):
                    with open(PID_PATH, "r", encoding="utf-8") as f:
                        saved_pid = int(f.read().strip())
                    if saved_pid == os.getpid():
                        os.remove(PID_PATH)
            except Exception:
                pass
        return

    # --- [부모/UI 모드] ---
    # 기존 백그라운드 데몬이 존재하면 먼저 깔끔히 종료
    terminate_existing_daemon()

    if total_h <= 0:
        print(f"\n🌙 [오토 플래너] 24시간 자율 모드 — {interval_h}시간마다 백그라운드 무한 반복 시작")
    else:
        print(f"\n🚀 [오토 플래너] {total_h}시간 동안 {interval_h}시간마다 트렌드 분석 백그라운드 구동")
        
    print("🔍 설정 및 환경 신속 검증 중...")
    ACCOUNT_PATH = os.path.join(HERE, "youtube_account.json")
    if not os.path.exists(ACCOUNT_PATH):
        print("❌ youtube_account.json 파일을 찾을 수 없습니다.")
        sys.exit(1)
        
    try:
        with open(ACCOUNT_PATH, "r", encoding="utf-8") as f:
            acct = json.load(f)
        if not acct.get("YOUTUBE_API_KEY"):
            print("❌ YOUTUBE_API_KEY가 비어있습니다. 설정이 필요합니다.")
            sys.exit(1)
    except Exception as e:
        print(f"❌ 설정 파일 검증 실패: {e}")
        sys.exit(1)
        
    print("✅ 사전 검증 완료.")
    
    # 1회차는 즉시 실행하여 사용자가 UI에서 분석 리포트를 즉시 볼 수 있게 함
    print("\n🤖 [1회차] 실시간 트렌드 분석 및 보고서 생성을 시작합니다...")
    try:
        subprocess.run([sys.executable, SNIPER_PATH], check=False)
    except Exception as e:
        print(f"❌ 1회차 실행 오류: {e}")
        sys.exit(1)
        
    # 2회차부터는 백그라운드 데몬 프로세스로 넘김 (90초 타임아웃 방지)
    print("\n🔄 [자율 주행] 2회차부터는 백그라운드에서 자율 동작하도록 전환합니다.")
    try:
        creationflags = 0
        if os.name == 'nt':
            # Windows에서 완전한 독립형 백그라운드 프로세스로 스폰 (부모 세션 종료 후에도 생존)
            creationflags = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
            
        subprocess.Popen(
            [sys.executable, __file__, "--daemon"],
            creationflags=creationflags,
            close_fds=True
        )
        print(f"✅ 백그라운드 자율 가동 성공! (로그 파일: tools/planner.log)")
        print(f"⏳ 다음 2회차 실행 예정: {interval_h}시간 후")
    except Exception as e:
        print(f"⚠️ 백그라운드 프로세스 기동 실패: {e}")
        
    print("\n🎉 모든 연동 및 1회차 분석이 정상 완료되었습니다. 레오 에이전트 가동 상태 전환 완료!")

if __name__ == "__main__":
    main()
