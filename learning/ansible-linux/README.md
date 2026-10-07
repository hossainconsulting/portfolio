# Ansible with Linux

A self-directed learning track: Linux administration from the shell up, then
Ansible to make the same work repeatable across many machines. Built alongside
the Salesforce and AI engineering projects in this portfolio, for the same
reason — a consultant who can only work through a UI is one outage away from
being stuck.

> **This is a learning record, not client work.** Every host in the lab is a
> local virtual machine or container. No production system appears anywhere in
> this folder.

**Built by:** [Hemayet Hossain](https://github.com/hossainconsulting) · Sydney, Australia
**Portfolio:** [portfolio.hossainconsulting.com](https://portfolio.hossainconsulting.com)

---

## Why this track

Every project on the portfolio runs on something. The Salesforce work runs on
Salesforce, but the tooling around it — the CI runner, the MCP server, the
scripts that seed an org — runs on Linux. Configuring one box by hand is fine.
Configuring the second one by hand is how drift starts, and Ansible is the
smallest tool that stops it: no agents on the target, nothing but SSH and
Python, and a plain-text description of what "correct" looks like.

The track is ordered so that Ansible is never magic. Each Ansible module is
introduced only after the Linux task it automates has been done by hand at
least once.

## Lab

| Host | Role | OS | Notes |
|---|---|---|---|
| `control` | Ansible control node | Ubuntu 24.04 | This is the machine the playbooks run from. |
| `web01` | Managed node | Ubuntu 24.04 | nginx target. |
| `web02` | Managed node | Ubuntu 24.04 | Second nginx target — two hosts makes idempotence and loops real. |
| `db01` | Managed node | Rocky Linux 9 | PostgreSQL target. A second distro forces `ansible_os_family` conditionals instead of hard-coded `apt`. |

All four are local VMs. The inventory in [`inventory/hosts.ini`](inventory/hosts.ini)
uses private lab addresses; change them to match your own machines.

## Curriculum

Twelve modules in three parts. Each module ends with a lab and a short note in
[`notes/`](notes/) recording what was actually learned — including what went
wrong — rather than a summary of the documentation.

### Part 1 — Linux by hand

| # | Module | Lab | Status |
|---|---|---|---|
| 01 | The shell, the filesystem hierarchy, and `man` | Navigate a fresh VM, find where logs, configs and binaries live, and explain why they live there | Not started |
| 02 | Users, groups, permissions and `sudo` | Create a deploy user with key-only SSH and scoped `sudo`; lock the root account | Not started |
| 03 | Packages, services and `systemd` | Install nginx on Ubuntu and Rocky; write a unit file for a small script and make it survive a reboot | Not started |
| 04 | Processes, logs and troubleshooting | Break a service on purpose and find the cause with `journalctl`, `ss`, `ps` and `strace` | Not started |
| 05 | SSH, keys and hardening | Key-only auth, `sshd_config` tightened, `fail2ban` running, and a written explanation of every change | Not started |

### Part 2 — Ansible fundamentals

| # | Module | Lab | Status |
|---|---|---|---|
| 06 | Inventory, ad-hoc commands and `ansible.cfg` | [`playbooks/00-ping.yml`](playbooks/00-ping.yml) reaches every host; gather facts and read them | Not started |
| 07 | Playbooks, tasks, modules and idempotence | [`playbooks/01-baseline.yml`](playbooks/01-baseline.yml) runs twice and reports `changed=0` the second time | Not started |
| 08 | Variables, facts, conditionals and loops | One playbook installs nginx on Ubuntu and Rocky using `ansible_os_family`, not two playbooks | Not started |
| 09 | Templates, handlers and files | [`playbooks/templates/motd.j2`](playbooks/templates/motd.j2) rendered per host; an nginx config change triggers a reload handler, not a restart | Not started |
| 10 | Roles and Ansible Galaxy | Refactor modules 07–09 into `common`, `web` and `db` roles; explain what a role should and should not own | Not started |

### Part 3 — Running it properly

| # | Module | Lab | Status |
|---|---|---|---|
| 11 | Ansible Vault and secrets | Database password in Vault; playbook runs with `--ask-vault-pass`; prove the secret never lands in a log | Not started |
| 12 | Testing, linting and a real deployment | `ansible-lint` clean, `--check --diff` before every run, and the full lab built from a blank VM in one command | Not started |

Status is updated as each module is completed. Anything marked *Not started*
has no note behind it, and the table will say so until it does.

## Ground rules for the track

Rules written down before starting, so they cannot be quietly relaxed later:

- **Do it by hand first.** No Ansible module is used before the underlying
  Linux task has been done manually. Automating something you cannot debug is
  how a playbook becomes a liability.
- **Idempotent or it is not done.** A playbook that reports changes on its
  second run has a bug. The lab for every playbook module includes running it
  twice.
- **`--check --diff` before every real run.** Every time, not just when it
  seems risky.
- **No secrets in plain text.** Not in playbooks, not in inventory, not in
  group_vars. Vault or nothing, from module 11 onward; before that, the lab
  has no secrets in it.
- **Write down what broke.** The notes are the deliverable. A note that says
  "worked first time" is suspicious and probably means the module was too easy.

## Running the lab playbooks

From the `learning/ansible-linux` directory, with `ansible-core` installed on
the control node and SSH key access to the managed nodes:

```bash
# once: the one collection the lab uses beyond ansible-core
ansible-galaxy collection install -r requirements.yml

# confirm every host in the inventory is reachable
ansible-playbook playbooks/00-ping.yml

# preview the baseline, then apply it, then prove it is idempotent
ansible-playbook playbooks/01-baseline.yml --check --diff
ansible-playbook playbooks/01-baseline.yml
ansible-playbook playbooks/01-baseline.yml    # expect changed=0 on every host
```

`ansible.cfg` in this folder points at the inventory and sets the defaults, so
no `-i` flag is needed when running from here.

## Folder layout

```
ansible-linux/
├── README.md            this file: the curriculum and the rules
├── ansible.cfg          defaults for the lab (inventory path, SSH settings)
├── requirements.yml     collections beyond ansible-core (community.general)
├── inventory/
│   └── hosts.ini        the four lab hosts, grouped by role
├── playbooks/
│   ├── 00-ping.yml      module 06: reachability and facts
│   ├── 01-baseline.yml  module 07: the baseline every host gets
│   └── templates/
│       └── motd.j2      module 09: a login banner rendered per host
└── notes/               one file per module, written after the lab
```

## What this is not

It is not a course, and it does not reproduce any course's material. The
module list is the order that made sense for someone whose day job is
application configuration and who needs the infrastructure underneath it to
stop being a mystery. The reference material is the Ansible documentation, the
distro manuals and `man`.
