import * as React from 'react';

import { SafeAreaView } from 'react-native';
import { Reader, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system'; // for Expo project

/**
 * ReaderPage
 * Please check the github to understand the usage of this component:https://github.com/victorsoares96/epubjs-react-native
 * @param path the path of the book in pdf/odf/epub format
 * @returns Page of Reader
 */
export default function ReaderPage(path:string) {
    const { goToLocation } = useReader();
    return (
    <SafeAreaView style={{ flex: 1 }}>
        <Reader
        src={path}
        fileSystem={useFileSystem}
        />
    </SafeAreaView>
    );
}
