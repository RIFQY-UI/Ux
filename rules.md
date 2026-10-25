# UXStore — Firebase Rules

Hanya **Firestore** dan **Authentication** yang dipakai. Firebase Storage tidak dipakai (ikon lewat ImgBB). Realtime Database dikunci total.

## 1. Firestore Rules
Firebase Console > Firestore Database > Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Admin = ada dokumen admins/{uid}. Dokumen ini hanya bisa dibuat manual lewat Console.
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    function validNew() {
      let d = request.resource.data;
      return d.keys().hasOnly(['name','category','description','version','sizeValue','sizeUnit',
                               'supportEmail','downloadUrl','iconUrl','status','uid','createdAt'])
        && d.status == 'pending'                       // pengajuan baru SELALU pending
        && d.uid == request.auth.uid
        && d.createdAt == request.time
        && d.name is string && d.name.size() >= 2 && d.name.size() <= 40
        && d.category in ['Game','Produktivitas','Sosial','Hiburan','Edukasi','Alat','Lainnya']
        && d.description is string && d.description.size() >= 20 && d.description.size() <= 1000
        && d.version is string && d.version.size() >= 1 && d.version.size() <= 20
        && d.sizeValue is number && d.sizeValue > 0 && d.sizeValue < 100000
        && d.sizeUnit in ['MB','GB']
        && d.supportEmail is string && d.supportEmail.matches('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$') && d.supportEmail.size() <= 100
        && d.downloadUrl is string && d.downloadUrl.matches('^https?://.+') && d.downloadUrl.size() <= 500
        && d.iconUrl is string && d.iconUrl.matches('^https://.+') && d.iconUrl.size() <= 500;
    }

    // Pembaruan hanya boleh diajukan pemilik aplikasi (uid sama) untuk aplikasi yang sudah tayang.
    function validUpd() {
      let d = request.resource.data;
      let app = get(/databases/$(database)/documents/apps/$(d.appId)).data;
      return d.keys().hasOnly(['appId','version','sizeValue','sizeUnit','downloadUrl','status','uid','createdAt'])
        && d.appId is string
        && app.uid == request.auth.uid && app.status == 'approved'
        && d.status == 'pending' && d.uid == request.auth.uid && d.createdAt == request.time
        && d.version is string && d.version.size() >= 1 && d.version.size() <= 20
        && d.sizeValue is number && d.sizeValue > 0 && d.sizeValue < 100000
        && d.sizeUnit in ['MB','GB']
        && d.downloadUrl is string && d.downloadUrl.matches('^https?://.+') && d.downloadUrl.size() <= 500;
    }

    match /apps/{appId} {
      // Publik hanya melihat yang disetujui; pemilik melihat miliknya; admin melihat semua.
      allow read: if resource.data.status == 'approved' || isAdmin()
                  || (request.auth != null && resource.data.uid == request.auth.uid);
      // Pengunjung (login anonim) hanya boleh membuat pengajuan berstatus pending.
      allow create: if request.auth != null && validNew();
      // Hanya admin yang boleh mengubah status, mengedit, atau menghapus.
      allow update, delete: if isAdmin();
    }

    match /updates/{id} {
      allow read: if isAdmin() || (request.auth != null && resource.data.uid == request.auth.uid);
      allow create: if request.auth != null && validUpd();
      allow update, delete: if isAdmin();   // hanya admin yang bisa menerapkan pembaruan
    }

    // Pengguna hanya bisa membaca dokumen admin miliknya sendiri; tidak ada yang bisa menulis dari klien.
    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false;
    }

    match /{document=**} { allow read, write: if false; }
  }
}
```

## 2. Realtime Database Rules (dikunci)
Firebase Console > Realtime Database > Rules

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

## 3. Setup yang wajib
1. **Authentication > Sign-in method**: aktifkan **Email/Password** (admin) dan **Anonymous** (pengunjung yang upload).
2. **Authentication > Users**: tambahkan akun admin (email + password), salin **UID**-nya.
3. **Firestore > Start collection** `admins` > Document ID = **UID admin** > tambahkan satu field bebas, misalnya `role` (string) = `admin`.
4. **Authentication > Settings > Authorized domains**: pastikan domain situs Anda terdaftar.
5. Isi `config.js` (Firebase + ImgBB).

## Catatan keamanan
- Password admin tidak pernah ada di kode; login lewat Firebase Authentication.
- Pengguna biasa tidak bisa mengubah `status`, karena `create` dipaksa `pending` dan `update`/`delete` khusus admin.
- API key Firebase web memang publik; keamanan ada di Rules di atas.
- API key ImgBB terlihat di sisi klien (tidak dapat dihindari tanpa backend). Pakai key khusus UXStore.
- Pembaruan (link/versi/ukuran) tidak langsung mengubah aplikasi tayang: masuk koleksi `updates` berstatus pending, baru diterapkan setelah admin menyetujui.
- Kepemilikan pembaruan mengikuti login anonim di perangkat pengunggah. Jika data browser terhapus, admin tetap bisa mengubah lewat tombol Edit.
- Link download dari pengunggah tidak diperiksa isinya; tinjau sebelum menyetujui.
