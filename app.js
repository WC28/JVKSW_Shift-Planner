const ROUTINE_UNITS = ["OPD", "ER / OPD เด็ก"];
const DEFAULT_STAFF = [
  "ศิริพร",
  "กิตติมาพร",
  "นัทธมน",
  "สุภาภรณ์",
  "พงศธร",
  "กนกวรรณ",
  "จุฑาพร",
  "วิฏฐิรษา",
];
const APRIL_2026_REFERENCE = {
  audit: {
    label: "Audit ส่งเดือนเมษายน 2569",
    pair: ["นัทธมน", "จุฑาพร"],
    scope: "ตรวจข้อมูลช่วงมกราคม ถึง มีนาคม 2569",
  },
  monthlyCheck: {
    current: "วิฏฐิรษา",
    currentLabel: "สิ้นเดือนเมษายน 2569 ส่งก่อน 5 พฤษภาคม 2569",
    next: "ศิริพร",
  },
  referenceNote:
    "เดือนเมษายน 2569 ให้ยึดตารางกระดาษเป็นข้อมูลถูกต้อง ส่วน Google Calendar เป็นเวรที่มีการสลับแลกกันภายหลัง",
  entries: [
    { dayNumber: 1, assignments: { OPD: "จุฑาพร", "ER / OPD เด็ก": "พงศธร" } },
    { dayNumber: 2, assignments: { OPD: "วิฏฐิรษา", "ER / OPD เด็ก": "กนกวรรณ" } },
    {
      dayNumber: 3,
      assignments: { OPD: "ศิริพร", "ER / OPD เด็ก": "จุฑาพร" },
    },
    { dayNumber: 7, assignments: { OPD: "กิตติมาพร", "ER / OPD เด็ก": "วิฏฐิรษา" } },
    { dayNumber: 8, assignments: { OPD: "นัทธมน", "ER / OPD เด็ก": "ศิริพร" } },
    { dayNumber: 9, assignments: { OPD: "สุภาภรณ์", "ER / OPD เด็ก": "กิตติมาพร" } },
    { dayNumber: 10, assignments: { OPD: "พงศธร", "ER / OPD เด็ก": "นัทธมน" } },
    { dayNumber: 16, assignments: { OPD: "กนกวรรณ", "ER / OPD เด็ก": "สุภาภรณ์" } },
    {
      dayNumber: 17,
      assignments: { OPD: "จุฑาพร", "ER / OPD เด็ก": "พงศธร" },
    },
    { dayNumber: 20, assignments: { OPD: "วิฏฐิรษา", "ER / OPD เด็ก": "กนกวรรณ" } },
    { dayNumber: 21, assignments: { OPD: "ศิริพร", "ER / OPD เด็ก": "จุฑาพร" } },
    { dayNumber: 22, assignments: { OPD: "กิตติมาพร", "ER / OPD เด็ก": "วิฏฐิรษา" } },
    { dayNumber: 23, assignments: { OPD: "นัทธมน", "ER / OPD เด็ก": "ศิริพร" } },
    { dayNumber: 24, assignments: { OPD: "สุภาภรณ์", "ER / OPD เด็ก": "กิตติมาพร" } },
    { dayNumber: 27, assignments: { OPD: "พงศธร", "ER / OPD เด็ก": "นัทธมน" } },
    { dayNumber: 28, assignments: { OPD: "กนกวรรณ", "ER / OPD เด็ก": "สุภาภรณ์" } },
    { dayNumber: 29, assignments: { OPD: "จุฑาพร", "ER / OPD เด็ก": "พงศธร" } },
    { dayNumber: 30, assignments: { OPD: "วิฏฐิรษา", "ER / OPD เด็ก": "กนกวรรณ" } },
  ],
};
const HOLIDAY_MAP = {
  "2026-04-06": "วันจักรี",
  "2026-04-13": "วันสงกรานต์",
  "2026-04-14": "วันสงกรานต์",
  "2026-04-15": "วันสงกรานต์",
  "2026-05-01": "วันแรงงานแห่งชาติ",
  "2026-05-04": "วันฉัตรมงคล",
};
const STORAGE_KEY = "opd-er-planner-snapshots-v2";

const state = {
  schedule: [],
  summary: null,
  year: null,
  month: null,
};

const yearInput = document.getElementById("yearInput");
const monthInput = document.getElementById("monthInput");
const includeSaturday = document.getElementById("includeSaturday");
const includeSunday = document.getElementById("includeSunday");
const avoidConsecutive = document.getElementById("avoidConsecutive");
const staffContainer = document.getElementById("staffContainer");
const mcattContainer = document.getElementById("mcattContainer");
const generateBtn = document.getElementById("generateBtn");
const exportBtn = document.getElementById("exportBtn");
const saveSnapshotBtn = document.getElementById("saveSnapshotBtn");
const savePngBtn = document.getElementById("savePngBtn");
const savePdfBtn = document.getElementById("savePdfBtn");
const resetNamesBtn = document.getElementById("resetNamesBtn");
const loadAprilReferenceBtn = document.getElementById("loadAprilReferenceBtn");
const loadSnapshotBtn = document.getElementById("loadSnapshotBtn");
const deleteSnapshotBtn = document.getElementById("deleteSnapshotBtn");
const snapshotSelect = document.getElementById("snapshotSelect");
const calendarViewBtn = document.getElementById("calendarViewBtn");
const tableViewBtn = document.getElementById("tableViewBtn");
const calendarWrap = document.getElementById("calendarWrap");
const tableWrap = document.getElementById("tableWrap");
const balanceWrap = document.getElementById("balanceWrap");
const summaryCards = document.getElementById("summaryCards");
const alertBox = document.getElementById("alertBox");
const specialWrap = document.getElementById("specialWrap");
const assumptionBox = document.getElementById("assumptionBox");

function initializeMonth() {
  const today = new Date();
  yearInput.value = today.getFullYear();
  monthInput.value = today.getMonth() + 1;
  includeSaturday.checked = false;
  includeSunday.checked = false;
}

function renderStaffInputs() {
  staffContainer.innerHTML = DEFAULT_STAFF.map((name, index) => {
    return `
      <div class="staff-card">
        <label>
          <span>ชื่อเจ้าหน้าที่ ${index + 1}</span>
          <input type="text" data-field="name" data-index="${index}" value="${name}" />
        </label>
        <label>
          <span>วันที่ไม่พร้อม</span>
          <input
            type="text"
            data-field="unavailable"
            data-index="${index}"
            placeholder="เช่น 3, 7, 19"
          />
        </label>
        <label>
          <span>ยอดเวรเดิม</span>
          <input
            type="number"
            data-field="carry"
            data-index="${index}"
            min="0"
            value="0"
          />
        </label>
      </div>
    `;
  }).join("");
}

function renderMcattInputs(names = DEFAULT_STAFF, values = []) {
  mcattContainer.innerHTML = `
    <table class="mcatt-table">
      <thead>
        <tr>
          <th>เจ้าหน้าที่</th>
          <th>ยอดออก MCATT สะสม</th>
        </tr>
      </thead>
      <tbody>
        ${names
          .map((name, index) => {
            const value = values[index] ?? "0";
            return `
              <tr>
                <td data-mcatt-name="${index}">${name}</td>
                <td>
                  <select data-mcatt-index="${index}">
                    ${Array.from({ length: 21 }, (_, option) => {
                      const selected = String(option) === String(value) ? "selected" : "";
                      return `<option value="${option}" ${selected}>${option}</option>`;
                    }).join("")}
                  </select>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function syncMcattNames() {
  const names = Array.from(staffContainer.querySelectorAll('[data-field="name"]')).map((input, index) => {
    return input.value.trim() || `เจ้าหน้าที่ ${index + 1}`;
  });
  const labels = Array.from(mcattContainer.querySelectorAll("[data-mcatt-name]"));
  labels.forEach((cell, index) => {
    cell.textContent = names[index] ?? `เจ้าหน้าที่ ${index + 1}`;
  });
}

function parseDayList(value, maxDay) {
  if (!value.trim()) {
    return new Set();
  }

  return new Set(
    value
      .split(",")
      .map((item) => Number.parseInt(item.trim(), 10))
      .filter((day) => Number.isInteger(day) && day >= 1 && day <= maxDay)
  );
}

function getStaffData(daysInMonth) {
  const cards = Array.from(staffContainer.querySelectorAll(".staff-card"));
  const mcattValues = Array.from(mcattContainer.querySelectorAll("[data-mcatt-index]")).map((select) => {
    return Number.parseInt(select.value, 10) || 0;
  });
  return cards.map((card, index) => {
    const name = card.querySelector('[data-field="name"]').value.trim() || `เจ้าหน้าที่ ${index + 1}`;
    const unavailableRaw = card.querySelector('[data-field="unavailable"]').value;
    const carry = Number.parseInt(card.querySelector('[data-field="carry"]').value, 10) || 0;
    const mcattCarry = mcattValues[index] ?? 0;

    return {
      id: index,
      name,
      unavailable: parseDayList(unavailableRaw, daysInMonth),
      carry,
      mcattCarry,
      totalAssigned: 0,
      lastAssignedDay: null,
      units: Object.fromEntries(ROUTINE_UNITS.map((unit) => [unit, 0])),
      special: {
        monthlyCheck: 0,
        audit: 0,
      },
    };
  });
}

function isIncludedDay(date) {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 6 && !includeSaturday.checked) {
    return false;
  }

  if (dayOfWeek === 0 && !includeSunday.checked) {
    return false;
  }

  return true;
}

function pickAssignee(candidates, dayNumber, unitName) {
  const filtered = candidates
    .map((person) => {
      const consecutivePenalty =
        avoidConsecutive.checked && person.lastAssignedDay === dayNumber - 1 ? 1000 : 0;
      const specialLoad = person.special.monthlyCheck + person.special.audit * 2;

      return {
        person,
        score:
          person.carry * 10 +
          person.totalAssigned * 10 +
          specialLoad * 8 +
          person.units[unitName] * 4 +
          consecutivePenalty +
          (person.lastAssignedDay === null ? 0 : person.lastAssignedDay / 100),
      };
    })
    .sort((left, right) => left.score - right.score || left.person.id - right.person.id);

  return filtered[0]?.person ?? null;
}

function getAvailablePeople(staffList, dayNumber, assignedToday) {
  return staffList.filter((person) => {
    return !assignedToday.has(person.id) && !person.unavailable.has(dayNumber);
  });
}

function getNthWeekdayOfMonth(year, month, weekday, nth) {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month - 1, day);
    if (date.getDay() === weekday) {
      count += 1;
      if (count === nth) {
        return day;
      }
    }
  }
  return null;
}

function getScheduleKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getHolidayLabel(year, month, day) {
  return HOLIDAY_MAP[getDateKey(year, month, day)] ?? null;
}

function readSnapshots() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeSnapshots(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderSnapshotOptions() {
  const snapshots = readSnapshots();
  if (!snapshots.length) {
    snapshotSelect.innerHTML = '<option value="">ยังไม่มีข้อมูลที่บันทึกไว้</option>';
    return;
  }

  snapshotSelect.innerHTML = [
    '<option value="">เลือกข้อมูลย้อนหลัง</option>',
    ...snapshots.map((item) => {
      return `<option value="${item.id}">${item.label}</option>`;
    }),
  ].join("");
}

function collectFormState() {
  const cards = Array.from(staffContainer.querySelectorAll(".staff-card"));
  return {
    year: Number.parseInt(yearInput.value, 10) || null,
    month: Number.parseInt(monthInput.value, 10) || null,
    includeSaturday: includeSaturday.checked,
    includeSunday: includeSunday.checked,
    avoidConsecutive: avoidConsecutive.checked,
    mcatt: Array.from(mcattContainer.querySelectorAll("[data-mcatt-index]")).map((select) => select.value),
    staff: cards.map((card) => ({
      name: card.querySelector('[data-field="name"]').value,
      unavailable: card.querySelector('[data-field="unavailable"]').value,
      carry: card.querySelector('[data-field="carry"]').value,
    })),
  };
}

function applyFormState(formState) {
  if (!formState) {
    return;
  }

  if (formState.year) {
    yearInput.value = formState.year;
  }

  if (formState.month) {
    monthInput.value = formState.month;
  }

  includeSaturday.checked = Boolean(formState.includeSaturday);
  includeSunday.checked = Boolean(formState.includeSunday);
  avoidConsecutive.checked = formState.avoidConsecutive !== false;
  renderStaffInputs();
  renderMcattInputs(DEFAULT_STAFF, formState.mcatt ?? []);

  const cards = Array.from(staffContainer.querySelectorAll(".staff-card"));
  formState.staff?.forEach((person, index) => {
    const card = cards[index];
    if (!card) {
      return;
    }

    card.querySelector('[data-field="name"]').value = person.name ?? "";
    card.querySelector('[data-field="unavailable"]').value = person.unavailable ?? "";
    card.querySelector('[data-field="carry"]').value = person.carry ?? "0";
  });
  syncMcattNames();
}

function getReferenceSchedule(year, month) {
  if (getScheduleKey(year, month) === "2026-04") {
    return APRIL_2026_REFERENCE;
  }

  return null;
}

function pickSpecialAssignee(candidates, specialKey) {
  const sorted = candidates
    .map((person) => ({
      person,
      score:
        person.special[specialKey] * 20 +
        person.carry * 10 +
        person.totalAssigned * 10 +
        person.mcattCarry * 2,
    }))
    .sort((left, right) => left.score - right.score || left.person.id - right.person.id);

  return sorted[0]?.person ?? null;
}

function isQuarterAuditMonth(month) {
  return [3, 6, 9, 12].includes(month);
}

function buildMcattQueue(staffList, turns = 16) {
  const working = staffList.map((person) => ({
    id: person.id,
    name: person.name,
    count: person.mcattCarry,
    picked: 0,
  }));

  const queue = [];
  for (let turn = 0; turn < turns; turn += 1) {
    working.sort((left, right) => {
      return left.count - right.count || left.picked - right.picked || left.id - right.id;
    });

    const next = working[0];
    next.count += 1;
    next.picked += 1;
    queue.push({
      step: turn + 1,
      name: next.name,
      projectedCount: next.count,
    });
  }

  return queue;
}

function buildForensicQueue(staffList) {
  return [...staffList]
    .map((person) => ({
      name: person.name,
      score:
        person.carry * 10 +
        person.totalAssigned * 10 +
        person.special.audit * 12 +
        person.mcattCarry * 4,
    }))
    .sort((left, right) => left.score - right.score || left.name.localeCompare(right.name))
    .map((person, index) => ({
      order: index + 1,
      name: person.name,
    }));
}

function buildReferenceSchedule(year, month, staffList, reference) {
  const warnings = [];
  const assumptions = [
    "เดือนเมษายน 2569 ใช้ตารางกระดาษเป็นฐานอ้างอิงหลัก",
    reference.referenceNote,
    "Google Calendar ในภาพถูกใช้เพื่อดูรายการที่มีการสลับแลกเวรภายหลัง ไม่ใช่ต้นฉบับตั้งเวร",
    "นิติจิตเวชยังคงเป็นคิวเตรียมพร้อมเผื่อมีเคส",
  ];

  const schedule = reference.entries.map((entry) => {
    const currentDate = new Date(year, month - 1, entry.dayNumber);
    const row = {
      dayNumber: entry.dayNumber,
      weekday: currentDate.toLocaleDateString("th-TH", { weekday: "long" }),
      assignments: {},
      unfilled: [],
    };

    ROUTINE_UNITS.forEach((unitName) => {
      row.assignments[unitName] = entry.assignments[unitName] ?? null;
    });

    Object.entries(row.assignments).forEach(([unitName, name]) => {
      const person = staffList.find((item) => item.name === name);
      if (!person) {
        warnings.push(`ไม่พบชื่อ ${name} ในรายชื่อเจ้าหน้าที่สำหรับเวร ${unitName} วันที่ ${entry.dayNumber}`);
        return;
      }

      person.totalAssigned += 1;
      person.lastAssignedDay = entry.dayNumber;
      person.units[unitName] += 1;
    });

    return row;
  });

  const monthlyCheckAssignee = staffList.find(
    (person) => person.name === reference.monthlyCheck.current
  );
  if (monthlyCheckAssignee) {
    monthlyCheckAssignee.special.monthlyCheck += 1;
  }

  const totals = staffList.map((person) => ({
    name: person.name,
    totalAssigned: person.totalAssigned,
    carry: person.carry,
    mcattCarry: person.mcattCarry,
    units: person.units,
    special: person.special,
  }));

  return {
    schedule,
    warnings,
    assumptions,
    totals,
    mcattQueue: buildMcattQueue(staffList),
    forensicQueue: buildForensicQueue(staffList),
    monthlyCheck: reference.monthlyCheck.current,
    monthlyCheckLabel: reference.monthlyCheck.currentLabel,
    monthlyCheckNext: reference.monthlyCheck.next,
    auditPair: reference.audit.pair,
    auditLabel: reference.audit.label,
    auditScope: reference.audit.scope,
    referenceMode: true,
    referenceNote: reference.referenceNote,
    daysScheduled: schedule.length,
    slotsRequired: schedule.length * ROUTINE_UNITS.length,
    slotsFilled: schedule.reduce((sum, row) => {
      return sum + Object.values(row.assignments).filter(Boolean).length;
    }, 0),
  };
}

function buildSchedule(year, month, staffList) {
  const reference = getReferenceSchedule(year, month);
  if (reference) {
    return buildReferenceSchedule(year, month, staffList, reference);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const schedule = [];
  const warnings = [];
  const assumptions = [
    "กำหนดให้เวรประจำรายวันมี 2 จุดคือ OPD และ ER / OPD เด็ก",
    "กำหนดให้นิติจิตเวชเป็นคิวเตรียมพร้อมรายวัน ไม่ใช่เวรที่มีงานแน่นอนทุกวัน",
    "กำหนดให้เดือน Audit เป็นเดือนสุดท้ายของไตรมาส คือ มีนาคม มิถุนายน กันยายน ธันวาคม",
    "กำหนดให้งานตรวจความถูกต้องของงานเป็นผู้รับผิดชอบ 1 คนต่อเดือนแบบไม่ผูกกับวันที่ตายตัว",
  ];

  const monthlyCheckAssignee = pickSpecialAssignee(staffList, "monthlyCheck");
  if (monthlyCheckAssignee) {
    monthlyCheckAssignee.special.monthlyCheck += 1;
  }

  let auditPair = [];
  if (isQuarterAuditMonth(month)) {
    const first = pickSpecialAssignee(staffList, "audit");
    if (first) {
      first.special.audit += 1;
      const second = pickSpecialAssignee(
        staffList.filter((person) => person.id !== first.id),
        "audit"
      );
      if (second) {
        second.special.audit += 1;
        auditPair = [first.name, second.name];
      } else {
        auditPair = [first.name];
      }
    }
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const currentDate = new Date(year, month - 1, dayNumber);
    if (!isIncludedDay(currentDate)) {
      continue;
    }

    const assignedToday = new Set();
    const row = {
      dayNumber,
      weekday: currentDate.toLocaleDateString("th-TH", { weekday: "long" }),
      assignments: {},
      unfilled: [],
    };

    ROUTINE_UNITS.forEach((unitName) => {
      const available = getAvailablePeople(staffList, dayNumber, assignedToday);

      const assignee = pickAssignee(available, dayNumber, unitName);
      if (!assignee) {
        row.assignments[unitName] = null;
        row.unfilled.push(unitName);
        return;
      }

      assignedToday.add(assignee.id);
      assignee.totalAssigned += 1;
      assignee.lastAssignedDay = dayNumber;
      assignee.units[unitName] += 1;
      row.assignments[unitName] = assignee.name;
    });

    if (row.unfilled.length > 0) {
      warnings.push(`วันที่ ${dayNumber} จัดเวรไม่ครบ: ${row.unfilled.join(", ")}`);
    }

    schedule.push(row);
  }

  const totals = staffList.map((person) => ({
    name: person.name,
    totalAssigned: person.totalAssigned,
    carry: person.carry,
    mcattCarry: person.mcattCarry,
    units: person.units,
    special: person.special,
  }));

  const mcattQueue = buildMcattQueue(staffList);

  return {
    schedule,
    warnings,
    assumptions,
    totals,
    mcattQueue,
    forensicQueue: buildForensicQueue(staffList),
    monthlyCheck: monthlyCheckAssignee?.name ?? null,
    monthlyCheckLabel: monthlyCheckAssignee ? "ผู้รับผิดชอบประจำเดือน" : null,
    monthlyCheckNext: null,
    auditPair,
    auditLabel: auditPair.length > 0 ? "Audit ราย 3 เดือน" : null,
    auditScope: auditPair.length > 0 ? "ระบบสมมติว่าเป็นรอบปลายไตรมาส" : null,
    referenceMode: false,
    referenceNote: null,
    daysScheduled: schedule.length,
    slotsRequired: schedule.length * ROUTINE_UNITS.length,
    slotsFilled: schedule.reduce((sum, row) => {
      return sum + Object.values(row.assignments).filter(Boolean).length;
    }, 0),
  };
}

function renderSummary(summary) {
  const shortageCount = summary.slotsRequired - summary.slotsFilled;
  summaryCards.innerHTML = `
    <div class="summary-card">
      <span>จำนวนวันในตาราง</span>
      <strong>${summary.daysScheduled}</strong>
    </div>
    <div class="summary-card">
      <span>ช่องเวรที่จัดได้</span>
      <strong>${summary.slotsFilled} / ${summary.slotsRequired}</strong>
    </div>
    <div class="summary-card">
      <span>ช่องเวรที่ยังว่าง</span>
      <strong>${shortageCount}</strong>
    </div>
  `;
}

function renderWarnings(warnings) {
  if (!warnings.length) {
    alertBox.classList.add("hidden");
    alertBox.textContent = "";
    return;
  }

  alertBox.classList.remove("hidden");
  alertBox.innerHTML = warnings.join("<br />");
}

function renderAssumptions(assumptions) {
  if (!assumptions.length) {
    assumptionBox.classList.add("hidden");
    assumptionBox.textContent = "";
    return;
  }

  assumptionBox.classList.remove("hidden");
  assumptionBox.innerHTML = assumptions.map((item) => `- ${item}`).join("<br />");
}

function renderSpecialSection(summary) {
  const mcattItems = summary.mcattQueue
    .slice(0, 8)
    .map((item) => `<li>${item.step}. ${item.name} (หลังออกงานรวม ${item.projectedCount})</li>`)
    .join("");
  const forensicItems = (summary.forensicQueue ?? [])
    .slice(0, 8)
    .map((item) => `<li>${item.order}. ${item.name}</li>`)
    .join("");
  const auditText =
    summary.auditPair.length > 0 ? summary.auditPair.join(" + ") : "เดือนนี้ยังไม่ถึงรอบ Audit";
  const monthlyCheckText = summary.monthlyCheck
    ? `${summary.monthlyCheck}${summary.monthlyCheckLabel ? ` (${summary.monthlyCheckLabel})` : ""}`
    : "ยังไม่สามารถจัดได้";
  const nextMonthlyCheckText = summary.monthlyCheckNext
    ? `เดือนถัดไป: ${summary.monthlyCheckNext}`
    : "";
  const auditScope = summary.auditScope ? `<p>${summary.auditScope}</p>` : "";
  const referenceNote = summary.referenceNote ? `<p>${summary.referenceNote}</p>` : "";

  specialWrap.innerHTML = `
    <article class="special-card">
      <h3>MCATT Queue</h3>
      <p>คิวพร้อมออกงานตามจำนวนครั้งสะสมน้อยกว่า</p>
      <ol class="queue-list">${mcattItems}</ol>
    </article>
    <article class="special-card">
      <h3>นิติจิตเวช</h3>
      <p>แสดงเป็นรายการคิวเมื่อมีเคส ไม่ลงในตารางรายวัน</p>
      <ol class="queue-list">${forensicItems}</ol>
    </article>
    <article class="special-card">
      <h3>ตรวจความถูกต้องของงาน</h3>
      <p>${monthlyCheckText}</p>
      <p>${nextMonthlyCheckText}</p>
    </article>
    <article class="special-card">
      <h3>${summary.auditLabel ?? "Audit ราย 3 เดือน"}</h3>
      <p>${auditText}</p>
      ${auditScope}
    </article>
    <article class="special-card">
      <h3>ฐานอ้างอิงเดือนนี้</h3>
      <p>${summary.referenceMode ? "ยึดตารางกระดาษ" : "ใช้การคำนวณจากกติกาในระบบ"}</p>
      ${referenceNote}
    </article>
  `;
}

function renderTable(schedule) {
  if (!schedule.length) {
    tableWrap.className = "table-wrap empty-state";
    tableWrap.textContent = "ไม่มีวันที่ตรงกับเงื่อนไขที่เลือก";
    return;
  }

  const body = schedule
    .map((row) => {
      const cells = ROUTINE_UNITS.map((unitName) => {
        const value = row.assignments[unitName];
        return `<td class="${value ? "" : "unfilled"}">${value ?? "ยังไม่สามารถจัดเวรได้"}</td>`;
      }).join("");

      return `
        <tr>
          <td>${row.dayNumber}</td>
          <td>${row.weekday}</td>
          ${cells}
        </tr>
      `;
    })
    .join("");

  tableWrap.className = "table-wrap";
  tableWrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>วันที่</th>
          <th>วัน</th>
          ${ROUTINE_UNITS.map((unitName) => `<th>${unitName}</th>`).join("")}
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderCalendar(schedule, year, month) {
  if (!schedule.length) {
    calendarWrap.className = "calendar-wrap empty-state";
    calendarWrap.textContent = "ไม่มีวันที่ตรงกับเงื่อนไขที่เลือก";
    return;
  }

  const weekdays = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  const byDay = new Map(schedule.map((row) => [row.dayNumber, row]));
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push('<div class="calendar-cell empty muted"></div>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const row = byDay.get(day);
    const date = new Date(year, month - 1, day);
    const weekday = weekdays[date.getDay()];
    const holidayLabel = getHolidayLabel(year, month, day);

    if (!row) {
      cells.push(`
        <div class="calendar-cell muted">
          <div class="calendar-date">
            <span>${day}</span>
            <span class="calendar-weekday">${weekday}</span>
          </div>
          ${holidayLabel ? `<div class="calendar-item holiday">${holidayLabel}</div>` : ""}
        </div>
      `);
      continue;
    }

    const items = [
      row.assignments.OPD
        ? `<div class="calendar-item opd"><strong>OPD</strong>: ${row.assignments.OPD}</div>`
        : "",
      row.assignments["ER / OPD เด็ก"]
        ? `<div class="calendar-item er"><strong>ER/เด็ก</strong>: ${row.assignments["ER / OPD เด็ก"]}</div>`
        : "",
      holidayLabel
        ? `<div class="calendar-item holiday"><strong>วันหยุด</strong>: ${holidayLabel}</div>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    cells.push(`
      <div class="calendar-cell">
        <div class="calendar-date">
          <span>${day}</span>
          <span class="calendar-weekday">${weekday}</span>
        </div>
        ${items}
      </div>
    `);
  }

  calendarWrap.className = "calendar-wrap";
  calendarWrap.innerHTML = `
    <div class="calendar-grid">
      ${weekdays.map((day) => `<div class="calendar-head">${day}</div>`).join("")}
      ${cells.join("")}
    </div>
  `;
}

function setViewMode(mode) {
  const showCalendar = mode === "calendar";
  calendarWrap.classList.toggle("hidden-view", !showCalendar);
  tableWrap.classList.toggle("hidden-view", showCalendar);
  calendarViewBtn.classList.toggle("active-view", showCalendar);
  tableViewBtn.classList.toggle("active-view", !showCalendar);
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function exportCalendarPng() {
  if (!state.schedule.length || !state.year || !state.month) {
    return;
  }

  const weekdays = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const byDay = new Map(state.schedule.map((row) => [row.dayNumber, row]));
  const daysInMonth = new Date(state.year, state.month, 0).getDate();
  const firstDay = new Date(state.year, state.month - 1, 1).getDay();
  const totalSlots = firstDay + daysInMonth;
  const weeks = Math.ceil(totalSlots / 7);
  const cellWidth = 260;
  const cellHeight = 180;
  const headerHeight = 70;
  const titleHeight = 90;
  const width = cellWidth * 7;
  const height = titleHeight + headerHeight + cellHeight * weeks;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fffdf9";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#1f2430";
  ctx.font = "700 38px 'Noto Sans Thai', sans-serif";
  ctx.fillText(`ตารางเวร ${monthNames[state.month - 1]} ${state.year + 543}`, 32, 56);
  ctx.font = "500 18px 'Noto Sans Thai', sans-serif";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("OPD / ER-OPD เด็ก / นิติจิตเวชคิวสำรอง / MCATT", 32, 84);

  weekdays.forEach((day, index) => {
    const x = index * cellWidth;
    ctx.fillStyle = "#f5efe7";
    ctx.fillRect(x, titleHeight, cellWidth, headerHeight);
    ctx.strokeStyle = "#d8d0c5";
    ctx.strokeRect(x, titleHeight, cellWidth, headerHeight);
    ctx.fillStyle = "#1f2430";
    ctx.font = "700 20px 'Noto Sans Thai', sans-serif";
    ctx.fillText(day, x + 16, titleHeight + 42);
  });

  for (let slot = 0; slot < weeks * 7; slot += 1) {
    const x = (slot % 7) * cellWidth;
    const y = titleHeight + headerHeight + Math.floor(slot / 7) * cellHeight;
    const day = slot - firstDay + 1;

    ctx.fillStyle = day >= 1 && day <= daysInMonth ? "#ffffff" : "#f7f4ef";
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.strokeStyle = "#d8d0c5";
    ctx.strokeRect(x, y, cellWidth, cellHeight);

    if (day < 1 || day > daysInMonth) {
      continue;
    }

    const holidayLabel = getHolidayLabel(state.year, state.month, day);
    const row = byDay.get(day);
    ctx.fillStyle = "#1f2430";
    ctx.font = "700 18px 'Noto Sans Thai', sans-serif";
    ctx.fillText(String(day), x + 12, y + 24);

    let lineY = y + 48;
    if (holidayLabel) {
      ctx.fillStyle = "#dff3f3";
      ctx.fillRect(x + 12, lineY - 18, cellWidth - 24, 24);
      ctx.fillStyle = "#0f6b70";
      ctx.font = "700 14px 'Noto Sans Thai', sans-serif";
      ctx.fillText(holidayLabel, x + 18, lineY);
      lineY += 30;
    }

    if (!row) {
      continue;
    }

    const lines = [
      row.assignments.OPD ? `OPD: ${row.assignments.OPD}` : null,
      row.assignments["ER / OPD เด็ก"] ? `ER/เด็ก: ${row.assignments["ER / OPD เด็ก"]}` : null,
    ].filter(Boolean);

    lines.forEach((line, index) => {
      const colors = ["#fde1dc", "#e2e6fb", "#f9edbf", "#dcefed"];
      ctx.fillStyle = colors[index] ?? "#eef2f7";
      ctx.fillRect(x + 12, lineY - 18, cellWidth - 24, 24);
      ctx.fillStyle = "#1f2430";
      ctx.font = "500 13px 'Noto Sans Thai', sans-serif";
      ctx.fillText(line, x + 18, lineY);
      lineY += 30;
    });
  }

  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }
    saveBlob(blob, `opd-er-calendar-${state.year}-${String(state.month).padStart(2, "0")}.png`);
  }, "image/png");
}

function exportCalendarPdf() {
  if (!state.schedule.length) {
    return;
  }

  window.print();
}

function renderBalance(totals) {
  balanceWrap.innerHTML = totals
    .sort((left, right) => right.totalAssigned - left.totalAssigned || left.name.localeCompare(right.name))
    .map((person) => {
      const unitTags = ROUTINE_UNITS.map((unitName) => {
        return `<span>${unitName}: ${person.units[unitName]}</span>`;
      }).join("");

      return `
        <article class="balance-card">
          <strong>${person.name}</strong>
          <p>
            เวรรายวัน ${person.totalAssigned} ครั้ง | ยอดเวรเดิม ${person.carry} |
            MCATT เดิม ${person.mcattCarry}
          </p>
          <p>
            ตรวจงาน ${person.special.monthlyCheck} | Audit ${person.special.audit}
          </p>
          <div class="unit-tags">${unitTags}</div>
        </article>
      `;
    })
    .join("");
}

function toCsv(schedule) {
  const headers = ["วันที่", "วัน", ...ROUTINE_UNITS];
  const rows = schedule.map((row) => {
    return [
      row.dayNumber,
      row.weekday,
      ...ROUTINE_UNITS.map((unitName) => row.assignments[unitName] ?? "ยังไม่สามารถจัดเวรได้"),
    ];
  });

  return [headers, ...rows]
    .map((cells) => cells.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function downloadCsv() {
  if (!state.schedule.length) {
    return;
  }

  const csv = toCsv(state.schedule);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const year = yearInput.value;
  const month = String(monthInput.value).padStart(2, "0");
  link.href = url;
  link.download = `opd-er-roster-${year}-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function saveSnapshot() {
  if (!state.summary || !state.schedule.length) {
    return;
  }

  const snapshots = readSnapshots();
  const stamp = new Date().toLocaleString("th-TH");
  const label = `${yearInput.value}/${String(monthInput.value).padStart(2, "0")} - ${stamp}`;
  const entry = {
    id: `${Date.now()}`,
    label,
    formState: collectFormState(),
    summary: state.summary,
    year: state.year,
    month: state.month,
  };

  snapshots.unshift(entry);
  writeSnapshots(snapshots.slice(0, 24));
  renderSnapshotOptions();
  snapshotSelect.value = entry.id;
}

function loadSnapshot() {
  const targetId = snapshotSelect.value;
  if (!targetId) {
    return;
  }

  const entry = readSnapshots().find((item) => item.id === targetId);
  if (!entry) {
    return;
  }

  applyFormState(entry.formState);
  state.schedule = entry.summary.schedule;
  state.summary = entry.summary;
  state.year = entry.year;
  state.month = entry.month;
  renderSummary(entry.summary);
  renderWarnings(entry.summary.warnings ?? []);
  renderAssumptions(entry.summary.assumptions ?? []);
  renderSpecialSection(entry.summary);
  renderCalendar(entry.summary.schedule, entry.year, entry.month);
  renderTable(entry.summary.schedule);
  renderBalance(entry.summary.totals ?? []);
  exportBtn.disabled = false;
  saveSnapshotBtn.disabled = false;
  savePngBtn.disabled = false;
  savePdfBtn.disabled = false;
  setViewMode("calendar");
}

function deleteSnapshot() {
  const targetId = snapshotSelect.value;
  if (!targetId) {
    return;
  }

  const next = readSnapshots().filter((item) => item.id !== targetId);
  writeSnapshots(next);
  renderSnapshotOptions();
}

function resetForm() {
  state.schedule = [];
  state.summary = null;
  state.year = null;
  state.month = null;
  renderStaffInputs();
  renderMcattInputs();
  includeSaturday.checked = false;
  includeSunday.checked = false;
  summaryCards.innerHTML = "";
  renderWarnings([]);
  renderAssumptions([]);
  specialWrap.innerHTML = "";
  balanceWrap.innerHTML = "";
  calendarWrap.className = "calendar-wrap empty-state";
  calendarWrap.textContent = 'กด "สร้างตารางเวร" เพื่อดูปฏิทินรายเดือน';
  tableWrap.className = "table-wrap empty-state";
  tableWrap.textContent = 'กด "สร้างตารางเวร" เพื่อเริ่มใช้งาน';
  exportBtn.disabled = true;
  saveSnapshotBtn.disabled = true;
  savePngBtn.disabled = true;
  savePdfBtn.disabled = true;
  setViewMode("calendar");
}

function loadAprilReference() {
  yearInput.value = 2026;
  monthInput.value = 4;
  includeSaturday.checked = false;
  includeSunday.checked = false;
  avoidConsecutive.checked = true;
  resetForm();
  yearInput.value = 2026;
  monthInput.value = 4;
  generateSchedule();
}

function generateSchedule() {
  const year = Number.parseInt(yearInput.value, 10);
  const month = Number.parseInt(monthInput.value, 10);

  if (!year || !month || month < 1 || month > 12) {
    alert("กรุณาระบุปีและเดือนให้ถูกต้อง");
    return;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const staffList = getStaffData(daysInMonth);
  const summary = buildSchedule(year, month, staffList);

  state.schedule = summary.schedule;
  state.summary = summary;
  state.year = year;
  state.month = month;

  renderSummary(summary);
  renderWarnings(summary.warnings);
  renderAssumptions(summary.assumptions);
  renderSpecialSection(summary);
  renderCalendar(summary.schedule, year, month);
  renderTable(summary.schedule);
  renderBalance(summary.totals);
  exportBtn.disabled = summary.schedule.length === 0;
  saveSnapshotBtn.disabled = summary.schedule.length === 0;
  savePngBtn.disabled = summary.schedule.length === 0;
  savePdfBtn.disabled = summary.schedule.length === 0;
  setViewMode("calendar");
}

generateBtn.addEventListener("click", generateSchedule);
exportBtn.addEventListener("click", downloadCsv);
saveSnapshotBtn.addEventListener("click", saveSnapshot);
savePngBtn.addEventListener("click", exportCalendarPng);
savePdfBtn.addEventListener("click", exportCalendarPdf);
resetNamesBtn.addEventListener("click", resetForm);
loadAprilReferenceBtn.addEventListener("click", loadAprilReference);
loadSnapshotBtn.addEventListener("click", loadSnapshot);
deleteSnapshotBtn.addEventListener("click", deleteSnapshot);
calendarViewBtn.addEventListener("click", () => setViewMode("calendar"));
tableViewBtn.addEventListener("click", () => setViewMode("table"));

initializeMonth();
renderStaffInputs();
renderMcattInputs();
renderSnapshotOptions();
setViewMode("calendar");
staffContainer.addEventListener("input", syncMcattNames);
