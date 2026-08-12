document.addEventListener("DOMContentLoaded", function () {
  const tokenUser = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsb2NhbGhvc3QiLCJzdWIiOjUyMSwiZXhwIjoxNzg2NTMxMzAxLCJuYmYiOjE3ODY1MjIzMDEsImlhdCI6MTc4NjUyMjMwMSwianRpIjoiZlowNE1SZ2wxRE5WRzFoc2tNaTBmZm5mZFVPRTdDeHdUSy9QUXozVWVhMD0iLCJzZXNpZCI6ImZmZTVhNzFlM2JmMTdlNjk3NGMwMWU5NzE1NjVlZjAzIiwidXNpZCI6NTE4Miwic2lkIjoxNjl9.hOjQqz7WoE1fzWq-NjHOqcbEtJtk86noETiufvE95vo";
  const timeStamp = new Date().getTime();
  const apiUrl = `https://corsproxy.io/?https://dev.onebox.co.id/api/news/get?startdate=01-01-2024&enddate=31-12-2030&wilayah=&actor=&city=&subject=&category=&limit=100&headline=&offset=0&token=${tokenUser}&_t=${timeStamp}`;

  // Fungsi filter khusus berita BGN / MBG & pembagian kategorinya
  function getKategoriMatch(item, kategoriHalaman) {
    const subject = (item.Subject || item.title || item.judul || "").toLowerCase();
    const content = (item.Content || item.content || item.isi || "").toLowerCase();
    const categoryField = (item.Category || item.category || item.kategori || "").toLowerCase();
    const textGabungan = `${subject} ${content} ${categoryField}`;

    const isBeritaBGN = textGabungan.includes("bgn") || 
                        textGabungan.includes("badan gizi") || 
                        textGabungan.includes("makan bergizi") || 
                        textGabungan.includes("makan gratis") || 
                        textGabungan.includes("mbg") || 
                        textGabungan.includes("sppg") || 
                        textGabungan.includes("satgas gizi") ||
                        textGabungan.includes("porsi");

    if (!isBeritaBGN) return false;

    if (kategoriHalaman === "mbg") {
      return textGabungan.includes("makan bergizi") || textGabungan.includes("makan gratis") || textGabungan.includes("mbg") || textGabungan.includes("gizi") || textGabungan.includes("menu");
    } 
    else if (kategoriHalaman === "korupsi") {
      return textGabungan.includes("korupsi") || textGabungan.includes("suap") || textGabungan.includes("gratifikasi") || textGabungan.includes("integritas") || textGabungan.includes("pengawasan") || textGabungan.includes("penindakan") || textGabungan.includes("penyalahgunaan");
    } 
    else if (kategoriHalaman === "tatakelola") {
      return textGabungan.includes("tata kelola") || textGabungan.includes("birokrasi") || textGabungan.includes("operasional") || textGabungan.includes("dapur") || textGabungan.includes("sanitasi") || textGabungan.includes("hygiene") || textGabungan.includes("logistik") || textGabungan.includes("standar");
    } 
    else if (kategoriHalaman === "transparansi") {
      return textGabungan.includes("transparansi") || textGabungan.includes("informasi publik") || textGabungan.includes("portal") || textGabungan.includes("real-time") || textGabungan.includes("pusat layanan") || textGabungan.includes("pengaduan");
    }
    return false;
  }

  // 1. Eksekusi untuk HALAMAN UTAMA (PRIORITY GRID / INDEX)
  const priorityContainer = document.querySelector(".priority-grid");
  if (priorityContainer) {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((result) => {
        let semuaBerita = result.data || result;
        if (!Array.isArray(semuaBerita)) return;

        const categories = [
          { id: "card-1", key: "mbg" },
          { id: "card-2", key: "korupsi" },
          { id: "card-3", key: "tatakelola" },
          { id: "card-4", key: "transparansi" }
        ];

        categories.forEach((cat) => {
          const cardElement = document.getElementById(cat.id);
          if (!cardElement) return;

          const filtered = semuaBerita.filter((item) => getKategoriMatch(item, cat.key));

          const badge = cardElement.querySelector(".badge-berita");
          if (badge) badge.innerText = `${filtered.length} Berita`;

          const top3 = filtered.slice(0, 3);
          const newsListContainer = cardElement.querySelector(".card-news-list");
          if (!newsListContainer) return;

          newsListContainer.innerHTML = "";
          if (top3.length === 0) {
            newsListContainer.innerHTML = `<p style="font-size: 12px; color: #6b7280; text-align: center; padding: 10px;">Belum ada berita.</p>`;
            return;
          }

          top3.forEach((item) => {
            const tanggal = item.WaktuTerbit || item.ReceiveDate || item.Date || "Baru saja";
            const lokasi = item.Wilayah || item.City || item.Location || "Pusat";
            const judul = item.Subject || item.title || item.judul || "Tanpa Judul";
            const imageId = (item.Attachment && item.Attachment.length > 0) ? item.Attachment[0] : "";
            const imageSrc = imageId 
              ? `https://dev.onebox.co.id/feature/publicrelation/FileManager/getfile/${imageId}` 
              : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80';

            const miniItem = document.createElement("div");
            miniItem.className = "mini-news-item";
            miniItem.innerHTML = `
              <img src="${imageSrc}" alt="Berita" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80';" />
              <div class="mini-news-info" style="min-width: 0; overflow: hidden;">
                <span class="mini-tag">INFORMASI TERBARU</span>
                <h4 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${judul}</h4>
                <div style="display: flex; flex-wrap: nowrap; gap: 10px; font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden;">
                  <span style="overflow: hidden; text-overflow: ellipsis;"><i class="fa-regular fa-calendar"></i> ${tanggal}</span>
                  <span style="overflow: hidden; text-overflow: ellipsis; flex-shrink: 0;"><i class="fa-solid fa-location-dot"></i> ${lokasi}</span>
                </div>
              </div>
            `;
            newsListContainer.appendChild(miniItem);
          });
        });
      })
      .catch((error) => console.error("Error Beranda:", error));
  }

  // 2. Eksekusi untuk BERITA UTAMA & SIDEBAR (NEWS SECTION)
  const mainNewsCard = document.querySelector(".news-main-card");
  const sidebarNewsList = document.querySelector(".news-list");

  if (mainNewsCard || sidebarNewsList) {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((result) => {
        let semuaBerita = result.data || result;
        if (!Array.isArray(semuaBerita) || semuaBerita.length === 0) return;

        if (mainNewsCard) {
          const mainItem = semuaBerita[0];
          const imageId = (mainItem.Attachment && mainItem.Attachment.length > 0) ? mainItem.Attachment[0] : "";
          const imageSrc = imageId 
            ? `https://dev.onebox.co.id/feature/publicrelation/FileManager/getfile/${imageId}` 
            : 'assets/berita-utama.jpg';

          mainNewsCard.innerHTML = `
            <div class="news-main-image">
              <img src="${imageSrc}" alt="${mainItem.Subject || mainItem.title || 'Berita Utama'}" onerror="this.src='assets/berita-utama.jpg';" />
              <div class="news-overlay">
                <div class="news-badge">${mainItem.Category || mainItem.kategori || 'PENGAWASAN & EVALUASI DAPUR'}</div>
                <div class="news-main-content">
                  <h2>${mainItem.Subject || mainItem.title || mainItem.judul || "Tanpa Judul"}</h2>
                  <div style="display: flex; flex-wrap: nowrap; gap: 15px; color: #64748b; font-size: 13px; white-space: nowrap; overflow: hidden;">
                    <span style="overflow: hidden; text-overflow: ellipsis;"><i class="fa-regular fa-calendar"></i> ${mainItem.WaktuTerbit || mainItem.ReceiveDate || mainItem.Date || "Baru saja"}</span>
                    <span style="overflow: hidden; text-overflow: ellipsis; flex-shrink: 0;"><i class="fa-solid fa-location-dot"></i> ${mainItem.Wilayah || mainItem.City || mainItem.Location || "Pusat"}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        if (sidebarNewsList) {
          const sidebarItems = semuaBerita.slice(1, 4);
          sidebarNewsList.innerHTML = "";

          if (sidebarItems.length === 0) {
            sidebarNewsList.innerHTML = `<p style="font-size: 13px; color: #6b7280; padding: 10px;">Belum ada berita lainnya.</p>`;
            return;
          }

          sidebarItems.forEach((item) => {
            const imageId = (item.Attachment && item.Attachment.length > 0) ? item.Attachment[0] : "";
            const imageSrc = imageId 
              ? `https://dev.onebox.co.id/feature/publicrelation/FileManager/getfile/${imageId}` 
              : 'assets/berita-1.jpg';

            const newsItemEl = document.createElement("div");
            newsItemEl.className = "news-item";
            newsItemEl.innerHTML = `
              <img src="${imageSrc}" alt="Berita" onerror="this.src='assets/berita-1.jpg';" />
              <div class="news-item-content" style="min-width: 0; overflow: hidden;">
                <span class="item-category">${item.Category || item.kategori || 'INFORMASI TERBARU'}</span>
                <h4 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.Subject || item.title || item.judul || "Tanpa Judul"}</h4>
                <div style="display: flex; flex-wrap: nowrap; gap: 10px; color: #64748b; font-size: 11px; white-space: nowrap; overflow: hidden;">
                  <span style="overflow: hidden; text-overflow: ellipsis;"><i class="fa-regular fa-calendar"></i> ${item.WaktuTerbit || item.ReceiveDate || item.Date || "Baru saja"}</span>
                  <span style="overflow: hidden; text-overflow: ellipsis; flex-shrink: 0;"><i class="fa-solid fa-location-dot"></i> ${item.Wilayah || item.City || item.Location || "Pusat"}</span>
                </div>
              </div>
            `;
            sidebarNewsList.appendChild(newsItemEl);
          });
        }
      })
      .catch((error) => console.error("Error News Section:", error));
  }

  // 3. Eksekusi untuk HALAMAN DETAIL BERITA
  const containerBerita = document.getElementById("container-berita");
  const sidebarDetailContent = document.getElementById("sidebar-detail-content");

  if (containerBerita) {
    const currentFileName = window.location.pathname.split("/").pop();
    let kategoriHalaman = "mbg";

    if (currentFileName.includes("pemberantasan-korupsi")) {
      kategoriHalaman = "korupsi";
    } else if (currentFileName.includes("penguatan-tata-kelola")) {
      kategoriHalaman = "tatakelola";
    } else if (currentFileName.includes("peningkatan-transparansi")) {
      kategoriHalaman = "transparansi";
    } else if (currentFileName.includes("makan-bergizi-gratis")) {
      kategoriHalaman = "mbg";
    }

    fetch(apiUrl)
      .then((response) => response.json())
      .then((result) => {
        let semuaBerita = result.data || result;
        containerBerita.innerHTML = "";

        if (!Array.isArray(semuaBerita) || semuaBerita.length === 0) {
          containerBerita.innerHTML = `<p style="padding: 20px; text-align: center; color: #6b7280;">Belum ada berita.</p>`;
          return;
        }

        let filteredBerita = semuaBerita.filter((item) => getKategoriMatch(item, kategoriHalaman));

        if (filteredBerita.length === 0) {
          containerBerita.innerHTML = `<p style="padding: 20px; text-align: center; color: #6b7280;">Berita terkait BGN tidak tersedia.</p>`;
          return;
        }

        // Tampilkan berita pertama di sidebar kanan saat halaman dimuat
        if (filteredBerita.length > 0 && sidebarDetailContent) {
          const firstItem = filteredBerita[0];
          const firstImgId = (firstItem.Attachment && firstItem.Attachment.length > 0) ? firstItem.Attachment[0] : "";
          const firstImgSrc = firstImgId ? `https://dev.onebox.co.id/feature/publicrelation/FileManager/getfile/${firstImgId}` : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80';
          const firstTanggal = firstItem.WaktuTerbit || firstItem.ReceiveDate || firstItem.Date || "Baru saja";
          const firstLokasi = firstItem.Wilayah || firstItem.City || firstItem.Location || "Pusat";
          const firstActor = firstItem.Actor || firstItem.actor || "-";
          const firstTag = firstItem.Tag || firstItem.tag || firstItem.Category || firstItem.category || "Umum";
          
          sidebarDetailContent.innerHTML = `
            <img src="${firstImgSrc}" alt="Foto Berita" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; line-height: 1.4;">
              ${firstItem.Subject || firstItem.title || firstItem.judul || "Tanpa Judul"}
            </h3>
            <div style="display: flex; flex-wrap: nowrap; gap: 20px; color: #64748b; font-size: 13px; margin-bottom: 12px; white-space: nowrap; overflow: hidden;">
              <span style="overflow: hidden; text-overflow: ellipsis;"><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i> ${firstTanggal}</span>
              <span style="overflow: hidden; text-overflow: ellipsis; flex-shrink: 0;"><i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i> ${firstLokasi}</span>
            </div>
            <div style="font-size: 14px; color: #475569; line-height: 1.6; text-align: justify; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-bottom: 15px;">
              ${firstItem.Content || firstItem.content || firstItem.isi || "<p>Tidak ada konten berita.</p>"}
            </div>
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px;">
              <div><strong><i class="fa-solid fa-user-tie"></i> Aktor:</strong> <span style="color: #0f172a;">${firstActor}</span></div>
              <div><strong><i class="fa-solid fa-tag"></i> Tag:</strong> <span style="background: #f1f5f9; color: #d97706; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; border: 1px solid #e2e8f0; display: inline-block;">${firstTag}</span></div>
            </div>
          `;
        }

        // Render daftar berita di sebelah kiri
        filteredBerita.forEach((item) => {
          const article = document.createElement("article");
          const tanggalBerita = item.WaktuTerbit || item.ReceiveDate || item.Date || "Tanggal tidak tersedia";
          const lokasiBerita = item.Wilayah || item.City || item.Location || "ANTARA";
          const judul = item.Subject || item.title || item.judul || "Tanpa Judul";
          const isi = item.Content || item.content || item.isi || "<p>Tidak ada konten berita.</p>";
          const actor = item.Actor || item.actor || "-";
          const tag = item.Tag || item.tag || item.Category || item.category || "Umum";
          
          let labelOren = "PROGRAM PRIORITAS BGN";
          if (kategoriHalaman === "mbg") labelOren = "MAKAN BERGIZI GRATIS (MBG)";
          else if (kategoriHalaman === "korupsi") labelOren = "PEMBERANTASAN KORUPSI BGN";
          else if (kategoriHalaman === "tatakelola") labelOren = "PENGUATAN TATA KELOLA BGN";
          else if (kategoriHalaman === "transparansi") labelOren = "PENINGKATAN TRANSPARANSI BGN";

          const imageId = (item.Attachment && item.Attachment.length > 0) ? item.Attachment[0] : "";
          const imageSrc = imageId 
            ? `https://dev.onebox.co.id/feature/publicrelation/FileManager/getfile/${imageId}` 
            : '';

          const finalImageTag = imageSrc 
            ? `<img src="${imageSrc}" alt="Foto Berita" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80';">`
            : `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 12px; background:#f8fafc;">Tanpa Foto</div>`;

          article.innerHTML = `
            <div style="display: flex; gap: 20px; align-items: flex-start; background: #fff; padding: 20px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="flex-shrink: 0; width: 160px; height: 120px; overflow: hidden; border-radius: 6px; background: #f1f5f9; border: 1px solid #cbd5e1;">
                ${finalImageTag}
              </div>
              <div style="flex-grow: 1; min-width: 0;">
                <span style="color: #d97706; font-weight: 700; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 6px;">
                  ${labelOren}
                </span>
                <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; line-height: 1.4;">
                  ${judul}
                </h3>
                <div style="display: flex; flex-wrap: nowrap; gap: 20px; color: #64748b; font-size: 13px; margin-bottom: 12px; white-space: nowrap; overflow: hidden;">
                  <span style="overflow: hidden; text-overflow: ellipsis;"><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i> ${tanggalBerita}</span>
                  <span style="overflow: hidden; text-overflow: ellipsis; flex-shrink: 0;"><i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i> ${lokasiBerita}</span>
                </div>
                <div>
                  <button class="btn-detail" data-judul="${judul.replace(/"/g, '&quot;')}" data-tanggal="${tanggalBerita.replace(/"/g, '&quot;')}" data-lokasi="${lokasiBerita.replace(/"/g, '&quot;')}" data-img="${imageSrc}" data-actor="${actor.replace(/"/g, '&quot;')}" data-tag="${tag.replace(/"/g, '&quot;')}" data-isi="${encodeURIComponent(isi)}" style="background: #d97706; color: #fff; border: none; font-weight: 700; cursor: pointer; padding: 6px 12px; font-size: 13px; border-radius: 4px; display: inline-flex; align-items: center; gap: 5px;">
                    <span>Lihat Selengkapnya</span> 
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
          containerBerita.appendChild(article);
        });
      })
      .catch((error) => console.error("Error Halaman Detail:", error));
  }
});

// Event global untuk tombol "Lihat Selengkapnya"
document.addEventListener("click", function(e) {
  const btn = e.target.closest(".btn-detail");
  if (btn) {
    const judul = btn.getAttribute("data-judul");
    const tanggal = btn.getAttribute("data-tanggal");
    const lokasi = btn.getAttribute("data-lokasi");
    const img = btn.getAttribute("data-img");
    const actor = btn.getAttribute("data-actor");
    const tag = btn.getAttribute("data-tag");
    const isi = decodeURIComponent(btn.getAttribute("data-isi"));
    const sidebarDetailContent = document.getElementById("sidebar-detail-content");

    if (sidebarDetailContent) {
      const imageTag = img ? `<img src="${img}" alt="Foto Berita" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80';">` : '';
      
      sidebarDetailContent.innerHTML = `
        ${imageTag}
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; line-height: 1.4;">
          ${judul}
        </h3>
        <div style="display: flex; flex-wrap: nowrap; gap: 20px; color: #64748b; font-size: 13px; margin-bottom: 12px; white-space: nowrap; overflow: hidden;">
          <span style="overflow: hidden; text-overflow: ellipsis;"><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i> ${tanggal}</span>
          <span style="overflow: hidden; text-overflow: ellipsis; flex-shrink: 0;"><i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i> ${lokasi}</span>
        </div>
        <div style="font-size: 14px; color: #475569; line-height: 1.6; text-align: justify; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-bottom: 15px;">
          ${isi}
        </div>
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px;">
          <div><strong><i class="fa-solid fa-user-tie"></i> Aktor:</strong> <span style="color: #0f172a;">${actor}</span></div>
          <div><strong><i class="fa-solid fa-tag"></i> Tag:</strong> <span style="background: #f1f5f9; color: #d97706; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; border: 1px solid #e2e8f0; display: inline-block;">${tag}</span></div>
        </div>
      `;
      
      sidebarDetailContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});