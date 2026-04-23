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
      icodr: "สุภากรณ์",
    },
    { dayNumber: 7, assignments: { OPD: "กิตติมาพร", "ER / OPD เด็ก": "วิฏฐิรษา" } },
    { dayNumber: 8, assignments: { OPD: "ทับทิม", "ER / OPD เด็ก": "ศิริพร" } },
    { dayNumber: 9, assignments: { OPD: "สุภากรณ์", "ER / OPD เด็ก": "กิตติมาพร" } },
    { dayNumber: 10, assignments: { OPD: "พงศธร", "ER / OPD เด็ก": "ทับทิม" } },
    { dayNumber: 16, assignments: { OPD: "กนกวรรณ", "ER / OPD เด็ก": "สุภากรณ์" } },
    {
      dayNumber: 17,
      assignments: { OPD: "จุฑาพร", "ER / OPD เด็ก": "พงศธร" },
      icodr: "พงศธร",
    },
    { dayNumber: 20, assignments: { OPD: "วิฏฐิรษา", "ER / OPD เด็ก": "กนกวรรณ" } },
    { dayNumber: 21, assignments: { OPD: "ศิริพร", "ER / OPD เด็ก": "จุฑาพร" } },
    { dayNumber: 22, assignments: { OPD: "กิตติมาพร", "ER / OPD เด็ก": "วิฏฐิรษา" } },
    { dayNumber: 23, assignments: { OPD: "ทับทิม", "ER / OPD เด็ก": "ศิริพร" } },
    { dayNumber: 24, assignments: { OPD: "สุภากรณ์", "ER / OPD เด็ก": "กิตติมาพร" } },
    { dayNumber: 27, assignments: { OPD: "พงศธร", "ER / OPD เด็ก": "ทับทิม" } },
    { dayNumber: 28, assignments: { OPD: "กนกวรรณ", "ER / OPD เด็ก": "สุภากรณ์" } },
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
  "2026-05-13": "วันพืชมงคล",
  "2026-06-01": "วันหยุดชดเชยวันวิสาขบูชา",
  "2026-06-03": "วันเฉลิมพระชนมพรรษาพระราชินี",
  "2026-07-28": "วันเฉลิมพระชนมพรรษา ร.10",
  "2026-07-29": "วันอาสาฬหบูชา",
  "2026-07-30": "วันเข้าพรรษา",
  "2026-08-12": "วันแม่แห่งชาติ",
  "2026-10-13": "วันนวมินทรมหาราช ร.9",
  "2026-10-23": "วันปิยมหาราช",
  "2026-12-07": "วันหยุดชดเชยวันพ่อแห่งชาติ",
  "2026-12-10": "วันรัฐธรรมนูญ",
  "2026-12-30": "วันสิ้นปี",
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
        <label>
          <span>ยอดออก MCATT เดิม</span>
          <input
            type="number"
            data-field="mcattCarry"
            data-index="${index}"
            min="0"
            value="0"
          />
        </label>
      </div>
    `;
  }).join("");
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
  return cards.map((card, index) => {
    const name = card.querySelector('[data-field="name"]').value.trim() || `เจ้าหน้าที่ ${index + 1}`;
    const unavailableRaw = card.querySelector('[data-field="unavailable"]').value;
    const carry = Number.parseInt(card.querySelector('[data-field="carry"]').value, 10) || 0;
    const mcattCarry = Number.parseInt(card.querySelector('[data-field="mcattCarry"]').value, 10) || 0;

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
        icodr: 0,
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
      const specialLoad =
        person.special.icodr + person.special.monthlyCheck + person.special.audit * 2;

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
    staff: cards.map((card) => ({
      name: card.querySelector('[data-field="name"]').value,
      unavailable: card.querySelector('[data-field="unavailable"]').value,
      carry: card.querySelector('[data-field="carry"]').value,
      mcattCarry: card.querySelector('[data-field="mcattCarry"]').value,
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

  const cards = Array.from(staffContainer.querySelectorAll(".staff-card"));
  formState.staff?.forEach((person, index) => {
    const card = cards[index];
    if (!card) {
      return;
    }

    card.querySelector('[data-field="name"]').value = person.name ?? "";
    card.querySelector('[data-field="unavailable"]').value = person.unavailable ?? "";
    card.querySelector('[data-field="carry"]').value = person.carry ?? "0";
    card.querySelector('[data-field="mcattCarry"]').value = person.mcattCarry ?? "0";
  });
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
        person.special.icodr * 8 +
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
      icodr: entry.icodr ?? null,
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

    if (row.icodr) {
      const person = staffList.find((item) => item.name === row.icodr);
      if (person) {
        person.special.icodr += 1;
      } else {
        warnings.push(`ไม่พบชื่อ ${row.icodr} ในรายชื่อเจ้าหน้าที่สำหรับ I-COD-R วันที่ ${entry.dayNumber}`);
      }
    }

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
    icodrDays: schedule.filter((row) => row.icodr).map((row) => row.dayNumber),
    referenceMode: true,
    referenceNote: reference.referenceNote,
    daysScheduled: schedule.length,
    slotsRequired:
      schedule.length * ROUTINE_UNITS.length +
      schedule.filter((row) => row.icodr !== null).length,
    slotsFilled: schedule.reduce((sum, row) => {
      return sum + Object.values(row.assignments).filter(Boolean).length + (row.icodr ? 1 : 0);
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
    "กำหนดให้นิติจิตเวชเป็นคิวเตรียมพร้อม ไม่ใช่เวรที่มีงานแน่นอนทุกวัน",
    "กำหนดให้ I-COD-R ลงในวันศุกร์สัปดาห์ที่ 2 และ 4 ของเดือน",
    "กำหนดให้เดือน Audit เป็นเดือนสุดท้ายของไตรมาส คือ มีนาคม มิถุนายน กันยายน ธันวาคม",
    "กำหนดให้งานตรวจความถูกต้องของงานเป็นผู้รับผิดชอบ 1 คนต่อเดือนแบบไม่ผูกกับวันที่ตายตัว",
  ];
  const icodrDays = new Set(
    [getNthWeekdayOfMonth(year, month, 5, 2), getNthWeekdayOfMonth(year, month, 5, 4)].filter(Boolean)
  );

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
      icodr: null,
    };

    if (icodrDays.has(dayNumber)) {
      const icodrAssignee = pickSpecialAssignee(getAvailablePeople(staffList, dayNumber, assignedToday), "icodr");
      if (icodrAssignee) {
        assignedToday.add(icodrAssignee.id);
        icodrAssignee.special.icodr += 1;
        row.icodr = icodrAssignee.name;
      } else {
        row.unfilled.push("I-COD-R");
      }
    }

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
      row.assignments[unitName] = assignee.name
