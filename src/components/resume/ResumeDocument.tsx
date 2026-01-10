import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { UserProfile } from '@/lib/schema';

// Register standard fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' }, // Regular
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'bold' } // Bold (using same url for mock, typically separate)
    ]
});

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#333' },
    header: { marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    title: { fontSize: 14, color: '#666', marginBottom: 4 },
    contact: { fontSize: 10, color: '#888' },
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', borderBottom: '1px solid #eee', marginBottom: 8, paddingBottom: 2, textTransform: 'uppercase' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    bold: { fontWeight: 'bold' },
    date: { color: '#666', fontSize: 10 },
    description: { lineHeight: 1.5, marginBottom: 8 },
    skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    skill: { backgroundColor: '#eee', padding: '2 6', borderRadius: 4, fontSize: 9 }
});

const SectionComponents: Record<string, (profile: UserProfile, styles: any) => React.ReactElement | null> = {
    summary: (profile, styles) => (
        <View style={{ marginTop: 8, marginBottom: 15 }}>
            <Text style={{ fontSize: 10, color: '#888', marginBottom: 2, textTransform: 'uppercase', fontWeight: 'bold' }}>Professional Summary</Text>
            <Text style={styles.description}>{profile.bio}</Text>
        </View>
    ),
    experience: (profile, styles) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map(exp => (
                <View key={exp.id} style={{ marginBottom: 10 }}>
                    <View style={styles.row}>
                        <Text style={styles.bold}>{exp.role}</Text>
                        <Text style={styles.date}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>{exp.company}</Text>
                    <Text style={styles.description}>{exp.description}</Text>
                </View>
            ))}
        </View>
    ),
    wins: (profile, styles) => {
        // Only show wins that are marked for resume. If no standard filtering applied yet, do it here.
        // Assuming profile.wins is already filtered by DownloadResume wrapper, but safe to filter again or just map.
        const wins = profile.wins.filter(w => w.showOnResume !== false && w.source !== 'github');
        if (wins.length === 0) return null;

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Achievements</Text>
                {wins.map(win => (
                    <View key={win.id} style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 10 }}>• {win.summary}</Text>
                    </View>
                ))}
            </View>
        );
    },
    skills: (profile, styles) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillRow}>
                {profile.skills.map(skill => (
                    <Text key={skill.name} style={styles.skill}>{skill.name}</Text>
                ))}
            </View>
        </View>
    ),
    education: (profile, styles) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map(edu => (
                <View key={edu.id}>
                    <View style={styles.row}>
                        <Text style={styles.bold}>{edu.school}</Text>
                        <Text style={styles.date}>{edu.graduationDate}</Text>
                    </View>
                    <Text>{edu.degree}</Text>
                </View>
            ))}
        </View>
    )
};

export const ResumeDocument = ({ profile }: { profile: UserProfile }) => {
    // Default config if missing
    const config = profile.resumeConfig || {
        template: 'tech',
        sections: [
            { id: 'summary', text: 'Professional Summary', visible: true },
            { id: 'wins', text: 'Key Achievements', visible: true },
            { id: 'experience', text: 'Experience', visible: true },
            { id: 'skills', text: 'Skills', visible: true },
            { id: 'education', text: 'Education', visible: true }
        ]
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Fixed Header (Name/Title) */}
                <View style={styles.header}>
                    <Text style={styles.name}>{profile.name || 'Your Name'}</Text>
                    <Text style={styles.title}>{profile.title}</Text>
                </View>

                {/* Dynamic Sections */}
                {config.sections
                    .filter(s => s.visible)
                    .map(s => {
                        const Component = SectionComponents[s.id];
                        return Component ? <View key={s.id}>{Component(profile, styles)}</View> : null;
                    })}
            </Page>
        </Document>
    );
};
