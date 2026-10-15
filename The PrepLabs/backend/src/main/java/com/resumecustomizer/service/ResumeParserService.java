package com.resumecustomizer.service;

import com.resumecustomizer.exception.ApiException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;

@Service
public class ResumeParserService {

    private static final int MIN_TEXT_LENGTH = 80;
    private static final int MAX_TEXT_LENGTH = 15000;

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The uploaded resume file is empty.");
        }

        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        String raw;

        try {
            if (name.endsWith(".pdf")) {
                raw = readPdf(file);
            } else if (name.endsWith(".docx")) {
                raw = readDocx(file);
            } else {
                throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PDF and DOCX files are supported.");
            }
        } catch (IOException e) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "The file could not be read. It may be corrupted or password protected.");
        }

        String text = raw.replaceAll("[ \\t]+", " ").replaceAll("\\n{3,}", "\n\n").trim();

        if (text.length() < MIN_TEXT_LENGTH) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "No readable text was found in the resume. Scanned or image-only files are not supported.");
        }

        return text.length() > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) : text;
    }

    private String readPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(document);
        }
    }

    private String readDocx(MultipartFile file) throws IOException {
        try (InputStream in = file.getInputStream();
             XWPFDocument document = new XWPFDocument(in);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }
}
