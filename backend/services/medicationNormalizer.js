/**
 * Normalizes common medical abbreviations and formats extracted data for consistency.
 */

const normalizeFrequency = (freqRaw) => {
    if (!freqRaw) return 'daily';
    const raw = freqRaw.toLowerCase().trim();
    if (raw.includes('od') || raw.includes('once') || raw === '1') return 'daily';
    if (raw.includes('bid') || raw.includes('bd') || raw.includes('twice') || raw === '2') return 'twice a day';
    if (raw.includes('tds') || raw.includes('tid') || raw.includes('thrice') || raw === '3') return 'thrice a day';
    if (raw.includes('qid') || raw.includes('four') || raw === '4') return 'four times a day';
    if (raw.includes('sos') || raw.includes('as needed')) return 'as needed';
    if (raw.includes('weekly')) return 'weekly';
    return freqRaw;
};

const normalizeTiming = (timingRaw) => {
    if (!timingRaw) return ['Morning'];
    const raw = timingRaw.toLowerCase().trim();
    const timings = [];
    
    if (raw.includes('morning') || raw.includes('am')) timings.push('Morning');
    if (raw.includes('afternoon') || raw.includes('noon')) timings.push('Afternoon');
    if (raw.includes('evening') || raw.includes('night') || raw.includes('pm') || raw.includes('hs')) timings.push('Night');
    
    if (timings.length === 0) {
        // Default to Morning if unparseable
        return ['Morning'];
    }
    return timings;
};

const normalizeMedicines = (medicines) => {
    return medicines.map(med => ({
        ...med,
        frequency: normalizeFrequency(med.frequency),
        times: med.times && med.times.length > 0 ? med.times : normalizeTiming(med.timingInstructions)
    }));
};

module.exports = {
    normalizeFrequency,
    normalizeTiming,
    normalizeMedicines
};
