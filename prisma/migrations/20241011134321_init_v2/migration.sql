/*
  Warnings:

  - You are about to drop the column `materiId` on the `Tugas` table. All the data in the column will be lost.
  - You are about to drop the `UserOnMateri` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `openIn` to the `Tugas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pelajaranId` to the `Tugas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Tugas" DROP CONSTRAINT "Tugas_materiId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnMateri" DROP CONSTRAINT "UserOnMateri_materiId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnMateri" DROP CONSTRAINT "UserOnMateri_userId_fkey";

-- AlterTable
ALTER TABLE "Materi" ALTER COLUMN "isi_materi" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tugas" DROP COLUMN "materiId",
ADD COLUMN     "files" JSONB[],
ADD COLUMN     "openIn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pelajaranId" BIGINT NOT NULL,
ALTER COLUMN "isi_tugas" DROP NOT NULL,
ALTER COLUMN "isi_tugas" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "UserOnMateri";

-- AddForeignKey
ALTER TABLE "Tugas" ADD CONSTRAINT "Tugas_pelajaranId_fkey" FOREIGN KEY ("pelajaranId") REFERENCES "Pelajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
