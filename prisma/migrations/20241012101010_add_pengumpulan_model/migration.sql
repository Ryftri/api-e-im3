/*
  Warnings:

  - You are about to drop the column `isi_pengumpulan` on the `Pengumpulan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pengumpulan" DROP COLUMN "isi_pengumpulan",
ADD COLUMN     "detail_pengumpulan" TEXT,
ADD COLUMN     "files" JSONB[];
