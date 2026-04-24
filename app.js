dToday,
        dayNumber,
        unitCursor[unitName]
      );
      const assignee = result.person;
      if (!assignee) {
        row.assignments[unitName] = null;
        row.unfilled.push(unitName);
        return;
      }

      unitCursor[unitName] = result.nextIndex;
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
