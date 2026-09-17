const fs = require('fs');
const path = require('path');

const ctrlPath = 'c:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/admin/admin-management.controller.ts';
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

// 1. Add resolveVaultServiceKey helper if not present
if (!ctrl.includes('function resolveVaultServiceKey')) {
  const insertBefore = 'const serializeAdminConfidentialBooking =';
  const helperCode = `function resolveVaultServiceKey(b: any): string {
  const desc = String(b.documentDescription || '');
  if (desc.includes('MultiPoint') || desc.includes('Multi-Office')) return 'VAULT_MULTIPOINT';
  if (desc.includes('Critical') || desc.includes('Armed')) return 'VAULT_CRITICAL';
  if (desc.includes('Exchange')) return 'VAULT_EXCHANGE';
  if (desc.includes('Return') || b.requiresReturn) return 'VAULT_RETURN';
  if (desc.includes('Hand Carry') || desc.includes('Luggage')) return 'VAULT_HAND_CARRY';
  if (desc.includes('Precise') || b.scheduleType === 'SCHEDULED') return 'VAULT_PRECISE';
  if (desc.includes('Direct')) return 'VAULT_DIRECT';
  if (desc.includes('Priority')) return 'VAULT_PRIORITY';
  if (desc.includes('Secure')) return 'VAULT_SECURE';

  const speedKey = String(b.deliverySpeed || '').toUpperCase();
  if (speedKey === 'EXACT_TIME') return 'VAULT_PRECISE';
  if (speedKey === 'EXPRESS') return 'VAULT_DIRECT';
  if (speedKey === 'PRIORITY') return 'VAULT_PRIORITY';
  return 'VAULT_SECURE';
}\n\n`;

  ctrl = ctrl.replace(insertBefore, helperCode + insertBefore);
  console.log('Added resolveVaultServiceKey helper.');
}

// 2. Update serializeAdminConfidentialBooking to use resolveVaultServiceKey
const oldVaultServiceLookup = `  const speedKey = String(booking.deliverySpeed || 'PRIORITY').toUpperCase();
  const speedTitle = CONFIDENTIAL_SPEED_TITLES[speedKey] || speedKey.replace(/_/g, ' ');
  const vaultService = CONFIDENTIAL_VAULT_SERVICES[speedKey] || {
    title: speedKey.replace(/_/g, ' '),
    tag: '',
    tagColor: '',
    time: '1-2 Days',
  };`;

const newVaultServiceLookup = `  const speedKey = String(booking.deliverySpeed || 'PRIORITY').toUpperCase();
  const speedTitle = CONFIDENTIAL_SPEED_TITLES[speedKey] || speedKey.replace(/_/g, ' ');
  const srvKey = resolveVaultServiceKey(booking);
  const vaultService = CONFIDENTIAL_VAULT_SERVICES[srvKey] || CONFIDENTIAL_VAULT_SERVICES.VAULT_SECURE;`;

if (ctrl.includes(oldVaultServiceLookup)) {
  ctrl = ctrl.replace(oldVaultServiceLookup, newVaultServiceLookup);
  console.log('Updated serializeAdminConfidentialBooking vaultService lookup.');
}

// Ensure serviceType is also exposed directly
if (ctrl.includes('vaultServiceType: vaultService.title,') && !ctrl.includes('serviceType: vaultService.title,')) {
  ctrl = ctrl.replace(
    'vaultServiceType: vaultService.title,',
    'serviceType: vaultService.title,\n    vaultServiceKey: srvKey,\n    vaultServiceType: vaultService.title,'
  );
  console.log('Added serviceType to serializeAdminConfidentialBooking.');
}

// 3. Update serviceType filtering in listAdminConfidentialBookings
const oldServiceTypeFilter = `  // 9 Vault Service Plans filtering:
  if (serviceType !== 'ALL') {
    const srvUpper = serviceType.toUpperCase();
    if (srvUpper === 'VAULT_SECURE' || srvUpper === 'STANDARD') {
      where.OR = [
        { deliverySpeed: 'STANDARD' },
        { documentDescription: { contains: 'Vault Secure', mode: 'insensitive' } }
      ];
    } else if (srvUpper === 'VAULT_PRIORITY' || srvUpper === 'PRIORITY') {
      where.OR = [
        { deliverySpeed: 'PRIORITY' },
        { documentDescription: { contains: 'Vault Priority', mode: 'insensitive' } }
      ];
    } else if (srvUpper === 'VAULT_DIRECT' || srvUpper === 'EXPRESS') {
      where.OR = [
        { deliverySpeed: 'EXPRESS' },
        { documentDescription: { contains: 'Vault Direct', mode: 'insensitive' } }
      ];
    } else if (srvUpper === 'VAULT_PRECISE' || srvUpper === 'EXACT_TIME') {
      where.OR = [
        { deliverySpeed: 'EXACT_TIME' },
        { documentDescription: { contains: 'Vault Precise', mode: 'insensitive' } }
      ];
    } else {
      const cleanName = serviceType.replace(/_/g, ' ');
      where.documentDescription = { contains: cleanName, mode: 'insensitive' };
    }
  }`;

const newServiceTypeFilter = `  // 9 Vault Service Plans filtering:
  if (serviceType !== 'ALL') {
    const srv = serviceType.replace(/_/g, ' ').toLowerCase();
    if (srv.includes('multipoint')) {
      where.OR = [
        { documentDescription: { contains: 'MultiPoint', mode: 'insensitive' } },
        { documentDescription: { contains: 'Multi-Office', mode: 'insensitive' } },
      ];
    } else if (srv.includes('critical')) {
      where.OR = [
        { documentDescription: { contains: 'Critical', mode: 'insensitive' } },
        { documentDescription: { contains: 'Armed', mode: 'insensitive' } },
      ];
    } else if (srv.includes('exchange')) {
      where.documentDescription = { contains: 'Exchange', mode: 'insensitive' };
    } else if (srv.includes('return')) {
      where.OR = [
        { requiresReturn: true },
        { documentDescription: { contains: 'Return', mode: 'insensitive' } },
      ];
    } else if (srv.includes('hand carry')) {
      where.OR = [
        { documentDescription: { contains: 'Hand Carry', mode: 'insensitive' } },
        { documentDescription: { contains: 'Luggage', mode: 'insensitive' } },
      ];
    } else if (srv.includes('precise')) {
      where.OR = [
        { scheduleType: 'SCHEDULED' },
        { documentDescription: { contains: 'Precise', mode: 'insensitive' } },
      ];
    } else if (srv.includes('direct')) {
      where.documentDescription = { contains: 'Direct', mode: 'insensitive' };
    } else if (srv.includes('priority')) {
      where.OR = [
        { deliverySpeed: 'PRIORITY' },
        { documentDescription: { contains: 'Priority', mode: 'insensitive' } },
      ];
    } else if (srv.includes('secure')) {
      where.OR = [
        { documentDescription: { contains: 'Secure', mode: 'insensitive' } },
        { documentDescription: null },
      ];
    }
  }`;

if (ctrl.includes(oldServiceTypeFilter)) {
  ctrl = ctrl.replace(oldServiceTypeFilter, newServiceTypeFilter);
  console.log('Updated serviceType filtering in listAdminConfidentialBookings.');
}

// 4. Update serviceCounts calculation in listAdminConfidentialBookings
const oldCountsCalc = `  // Build dynamic counts for the 9 vault service cards
  const speedMap: Record<string, number> = {};
  speedGroups.forEach((g: any) => {
    speedMap[g.deliverySpeed] = g._count._all;
  });

  const serviceCounts: Record<string, number> = {
    ALL: speedGroups.reduce((acc: number, g: any) => acc + g._count._all, 0),
    VAULT_SECURE: speedMap['STANDARD'] || 0,
    VAULT_PRIORITY: speedMap['PRIORITY'] || 0,
    VAULT_DIRECT: speedMap['EXPRESS'] || 0,
    VAULT_PRECISE: speedMap['EXACT_TIME'] || 0,
    VAULT_HAND_CARRY: 0,
    VAULT_RETURN: 0,
    VAULT_EXCHANGE: 0,
    VAULT_CRITICAL: 0,
    VAULT_MULTIPOINT: 0,
  };`;

const newCountsCalc = `  // Build dynamic counts for the 9 vault service cards
  const allBookingsForCounts = await prisma.confidentialCourierBooking.findMany({
    select: { documentDescription: true, requiresReturn: true, scheduleType: true, deliverySpeed: true }
  });

  const serviceCounts: Record<string, number> = {
    ALL: allBookingsForCounts.length,
    VAULT_SECURE: 0,
    VAULT_PRIORITY: 0,
    VAULT_DIRECT: 0,
    VAULT_PRECISE: 0,
    VAULT_HAND_CARRY: 0,
    VAULT_RETURN: 0,
    VAULT_EXCHANGE: 0,
    VAULT_CRITICAL: 0,
    VAULT_MULTIPOINT: 0,
  };

  allBookingsForCounts.forEach((b: any) => {
    const k = resolveVaultServiceKey(b);
    if (serviceCounts[k] !== undefined) {
      serviceCounts[k] += 1;
    }
  });`;

if (ctrl.includes(oldCountsCalc)) {
  ctrl = ctrl.replace(oldCountsCalc, newCountsCalc);
  console.log('Updated serviceCounts calculation dynamically.');
}

fs.writeFileSync(ctrlPath, ctrl, 'utf8');
console.log('Updated admin-management.controller.ts successfully.');
