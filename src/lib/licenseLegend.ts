import type { TranslationKey } from './i18n'

export interface LicenseInfo {
  spdxId: string
  name: string
  description: TranslationKey
  category: 'permissive' | 'copyleft' | 'public-domain' | 'other'
}

export const LICENSE_LEGEND: LicenseInfo[] = [
  {
    spdxId: 'MIT',
    name: 'MIT License',
    description: 'license.desc.MIT',
    category: 'permissive',
  },
  {
    spdxId: 'Apache-2.0',
    name: 'Apache License 2.0',
    description: 'license.desc.Apache-2.0',
    category: 'permissive',
  },
  {
    spdxId: 'BSD-2-Clause',
    name: 'BSD 2-Clause "Simplified"',
    description: 'license.desc.BSD-2-Clause',
    category: 'permissive',
  },
  {
    spdxId: 'BSD-3-Clause',
    name: 'BSD 3-Clause "New"',
    description: 'license.desc.BSD-3-Clause',
    category: 'permissive',
  },
  {
    spdxId: 'ISC',
    name: 'ISC License',
    description: 'license.desc.ISC',
    category: 'permissive',
  },
  {
    spdxId: 'GPL-2.0',
    name: 'GNU General Public License 2.0',
    description: 'license.desc.GPL-2.0',
    category: 'copyleft',
  },
  {
    spdxId: 'GPL-3.0',
    name: 'GNU General Public License 3.0',
    description: 'license.desc.GPL-3.0',
    category: 'copyleft',
  },
  {
    spdxId: 'LGPL-2.1',
    name: 'GNU Lesser General Public License 2.1',
    description: 'license.desc.LGPL-2.1',
    category: 'copyleft',
  },
  {
    spdxId: 'LGPL-3.0',
    name: 'GNU Lesser General Public License 3.0',
    description: 'license.desc.LGPL-3.0',
    category: 'copyleft',
  },
  {
    spdxId: 'AGPL-3.0',
    name: 'GNU Affero General Public License 3.0',
    description: 'license.desc.AGPL-3.0',
    category: 'copyleft',
  },
  {
    spdxId: 'MPL-2.0',
    name: 'Mozilla Public License 2.0',
    description: 'license.desc.MPL-2.0',
    category: 'copyleft',
  },
  {
    spdxId: 'Unlicense',
    name: 'The Unlicense',
    description: 'license.desc.Unlicense',
    category: 'public-domain',
  },
  {
    spdxId: 'CC0-1.0',
    name: 'Creative Commons Zero 1.0',
    description: 'license.desc.CC0-1.0',
    category: 'public-domain',
  },
  {
    spdxId: 'BSL-1.0',
    name: 'Boost Software License 1.0',
    description: 'license.desc.BSL-1.0',
    category: 'permissive',
  },
  {
    spdxId: 'Zlib',
    name: 'zlib License',
    description: 'license.desc.Zlib',
    category: 'permissive',
  },
]

const ADDITIONAL_OSI = ['Artistic-2.0', 'EPL-1.0', 'EPL-2.0', 'EUPL-1.1', 'EUPL-1.2', 'OFL-1.1', 'WTFPL', '0BSD', 'BlueOak-1.0.0']

export const OSI_LICENSE_IDS = new Set([
  ...LICENSE_LEGEND.map((l) => l.spdxId),
  ...ADDITIONAL_OSI,
])

export const CATEGORY_LABELS: Record<LicenseInfo['category'], TranslationKey> = {
  permissive: 'license.category.permissive',
  copyleft: 'license.category.copyleft',
  'public-domain': 'license.category.publicDomain',
  other: 'license.category.other',
}

export const CATEGORY_COLORS: Record<LicenseInfo['category'], string> = {
  permissive: 'text-green-400',
  copyleft: 'text-orange-400',
  'public-domain': 'text-blue-400',
  other: 'text-github-muted',
}
