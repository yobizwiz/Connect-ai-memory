# c:\Users\jinoh\Desktop\Connect AI\scripts\memory_diet.py
import os
import re
import zipfile

def clean_verified_file(file_path):
    """
    Cleans verified.md files by:
    1. Removing exact duplicate lines.
    2. Keeping only the latest 100 active facts in verified.md to optimize RAG.
    3. Archiving older facts into verified_backup.md to prevent data loss.
    """
    if not os.path.exists(file_path):
        return
    
    print(f"[*] Processing verified knowledge: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    header_lines = []
    fact_lines = []
    
    # Separate header from actual facts
    for line in lines:
        if line.strip().startswith("- "):
            fact_lines.append(line)
        else:
            header_lines.append(line)
            
    # Deduplicate exact lines first
    seen_lines = set()
    unique_fact_lines = []
    for line in fact_lines:
        if line.strip() not in seen_lines:
            seen_lines.add(line.strip())
            unique_fact_lines.append(line)
            
    total_facts = len(unique_fact_lines)
    
    # If the file is small, keep everything active
    if total_facts <= 100:
        active_facts = unique_fact_lines
        archived_facts = []
    else:
        # Keep the latest 100 facts (the last 100 lines) in verified.md
        # and archive the older ones
        active_facts = unique_fact_lines[-100:]
        archived_facts = unique_fact_lines[:-100]
        
    # Write active facts to verified.md
    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(header_lines)
        f.writelines(active_facts)
        
    # Append archived facts to verified_backup.md
    if archived_facts:
        backup_path = file_path.replace("verified.md", "verified_backup.md")
        # Read existing backup if any to avoid duplicates
        existing_backup_lines = []
        if os.path.exists(backup_path):
            with open(backup_path, "r", encoding="utf-8") as bf:
                existing_backup_lines = bf.readlines()
                
        # Combine and keep unique
        backup_header = [
            f"# 💼 {os.path.basename(file_path).split('.')[0].upper()} - 백업 지식 아카이브\n",
            "_RAG 성능 최적화를 위해 verified.md에서 백업된 오래된 역사적 지식입니다._\n\n"
        ]
        
        existing_facts = [l for l in existing_backup_lines if l.strip().startswith("- ")]
        all_backup_facts = existing_facts + archived_facts
        
        # Deduplicate backup facts
        seen_backup = set()
        unique_backup_facts = []
        for line in all_backup_facts:
            if line.strip() not in seen_backup:
                seen_backup.add(line.strip())
                unique_backup_facts.append(line)
                
        with open(backup_path, "w", encoding="utf-8") as bf:
            bf.writelines(backup_header)
            bf.writelines(unique_backup_facts)
            
        print(f"[+] Cleaned & Compacted: {total_facts} total -> 100 active, {len(unique_backup_facts)} archived in backup.")
    else:
        print(f"[+] Left unchanged (size within limits): {total_facts} lines")


def clean_memory_file(file_path):
    """
    Cleans memory.md files by deduplicating redundant cycle logs under ## 학습 기록.
    """
    if not os.path.exists(file_path):
        return
        
    print(f"[*] Processing agent memory: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    cleaned_lines = []
    seen_logs = set()
    in_learning_record = False
    
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("## 학습 기록") or stripped.startswith("## 학습 요약"):
            in_learning_record = True
            cleaned_lines.append(line)
            continue
        elif stripped.startswith("## ") and in_learning_record:
            in_learning_record = False
            
        if in_learning_record and stripped.startswith("- "):
            # Deduplicate learning records
            core = stripped
            core = re.sub(r"^-\s*\[\d{4}-\d{2}-\d{2}\]\s*", "", core)
            core = re.sub(r"^[→\s\-\*\|]*", "", core).strip()
            normalized = " ".join(core.split()).lower()
            
            if normalized not in seen_logs:
                seen_logs.add(normalized)
                cleaned_lines.append(line)
        else:
            cleaned_lines.append(line)
            
    # For very large learning records, we can keep the latest 100 logs
    learning_logs = [l for l in cleaned_lines if l.strip().startswith("- ") and "학습 기록" in "".join(cleaned_lines[:cleaned_lines.index(l)])]
    if len(learning_logs) > 100:
        print(f"[*] Learning records too large ({len(learning_logs)} lines). Archiving older logs...")
        # Write to memory_backup_20260529.md
        backup_path = file_path.replace("memory.md", "memory_backup_20260529.md")
        
        backup_header = [
            f"# 💼 메모리 백업 아카이브\n",
            "_RAG 성능 최적화를 위해 memory.md에서 백업된 오래된 역사적 활동 기록입니다._\n\n"
        ]
        
        with open(backup_path, "a", encoding="utf-8") as bf:
            if bf.tell() == 0:
                bf.writelines(backup_header)
            bf.writelines(learning_logs[:-100])
            
        # Rebuild cleaned lines keeping only latest 100 logs
        rebuilt_lines = []
        log_counter = 0
        keep_logs = set(learning_logs[-100:])
        
        for line in cleaned_lines:
            if line.strip().startswith("- ") and line in learning_logs:
                if line in keep_logs:
                    rebuilt_lines.append(line)
            else:
                rebuilt_lines.append(line)
        cleaned_lines = rebuilt_lines

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(cleaned_lines)
        
    print(f"[+] Cleaned memory: {len(lines)} -> {len(cleaned_lines)} lines")


def generate_high_density_summary(file_path):
    """
    Generates a high-density strategic summary of a raw conversation file.
    Filters out massive agent output logs and keeps only high-level decisions and tasks.
    """
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Split content by markdown headers
    lines = content.splitlines()
    summary_lines = []
    
    summary_lines.append(f"# 📜 {os.path.basename(file_path)} 회사 대화록 (고밀도 요약본)")
    summary_lines.append("")
    summary_lines.append("> [!NOTE]")
    summary_lines.append("> 이 파일은 RAG 성능 최적화를 위해 원본의 방대한 코딩 및 실행 로그를 압축하고, 핵심 의사결정 및 작업 흐름만 남긴 요약본입니다.")
    summary_lines.append("> 원본 파일은 동일한 디렉토리의 `archive.zip`에 안전하게 보관되어 있습니다.")
    summary_lines.append("")
    
    current_section = []
    include_section = False
    
    for line in lines:
        stripped = line.strip()
        
        # Check if we hit a new event header
        if stripped.startswith("## "):
            if include_section and current_section:
                summary_lines.extend(current_section)
                summary_lines.append("")
            current_section = [line]
            # Include if it is User Input, CEO instructions, or final CEO summaries
            include_section = any(x in stripped for x in [
                "사용자", "🧭 **CEO**", "👔 CEO", "종합 보고서", "완료된 작업", "다음 액션", "자율 잡담"
            ])
        elif include_section:
            # We want to filter out giant code blocks and tools even within these sections
            if "create_file" in line or "edit_file" in line or "run_command" in line:
                current_section.append(f"`[시스템 도구 실행: {stripped}]`")
                include_section = False # stop capturing this segment
            else:
                current_section.append(line)
        elif stripped.startswith("# "):
            pass # skip main header as we set our own
            
    # Include last section if valid
    if include_section and current_section:
        summary_lines.extend(current_section)
        
    return "\n".join(summary_lines)


def compact_conversations(directory_path, exclude_files=["2026-05-29.md"]):
    """
    Zips old raw conversation logs and replaces them with high-density summaries.
    """
    if not os.path.exists(directory_path):
        return
        
    print(f"[*] Compacting conversations in: {directory_path}")
    md_files = [f for f in os.listdir(directory_path) if f.endswith(".md") and f not in exclude_files]
    
    if not md_files:
        print("[+] No conversation files to compact.")
        return
        
    zip_path = os.path.join(directory_path, "archive.zip")
    
    # Create zip file for raw backups
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for md_file in md_files:
            full_path = os.path.join(directory_path, md_file)
            zipf.write(full_path, md_file)
            print(f"[+] Archived raw: {md_file} -> archive.zip")
            
    # Replace raw markdown files with summaries
    for md_file in md_files:
        full_path = os.path.join(directory_path, md_file)
        summary_content = generate_high_density_summary(full_path)
        
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(summary_content)
            
        print(f"[+] Replaced {md_file} with high-density summary (Size: {len(summary_content)/1024:.2f} KB)")


def main():
    workspace_root = r"C:\Users\jinoh\Desktop\Connect AI"
    agents_dir = os.path.join(workspace_root, "_agents")
    
    # 1. Clean agent verified.md and memory.md
    for agent in os.listdir(agents_dir):
        agent_path = os.path.join(agents_dir, agent)
        if os.path.isdir(agent_path):
            verified_path = os.path.join(agent_path, "verified.md")
            memory_path = os.path.join(agent_path, "memory.md")
            
            clean_verified_file(verified_path)
            clean_memory_file(memory_path)
            
    # 2. Compact company conversations
    company_conv_dir = os.path.join(workspace_root, "_company", "00_Raw", "conversations")
    compact_conversations(company_conv_dir)
    
    # 3. Compact root conversations
    root_conv_dir = os.path.join(workspace_root, "00_Raw", "conversations")
    compact_conversations(root_conv_dir)
    
    print("[***] Memory diet successfully completed! [***]")

if __name__ == "__main__":
    main()
